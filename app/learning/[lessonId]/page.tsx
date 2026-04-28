"use client";

import { useRouter, useParams } from "next/navigation";
import AuthGuard from "@/components/common/AuthGuard";
import { lessons } from "@/data/lessons";
import { useState, useEffect, useRef } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { loadOnnxModel, predictFromLandmarks } from "@/app/lib/onnxModel";
import {
  HandLandmarker,
  FilesetResolver,
} from "@mediapipe/tasks-vision";

export default function LessonDetailPage() {
  const router = useRouter();
  const params = useParams();

  const lessonId = Number(params.lessonId); 
  const lessonSigns = lessons[lessonId as keyof typeof lessons];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [status, setStatus] = useState("Performing...");
  const [cameraStarted, setCameraStarted] = useState(false);
  const [mediapipeReady, setMediapipeReady] = useState(false);
  const [handDetected, setHandDetected] = useState(false);
  const [modelStatus, setModelStatus] = useState("Not Loaded");
  const [predictedLabel, setPredictedLabel] = useState("None");
  const [predictionConfidence, setPredictionConfidence] = useState(0);
  const [handLandmarker, setHandLandmarker] = useState<HandLandmarker | null>(null);
  const [isAdvancing, setIsAdvancing] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const correctSoundRef = useRef<HTMLAudioElement | null>(null);
  const [showCorrectTick, setShowCorrectTick] = useState(false);

  useEffect(() => {
  correctSoundRef.current = new Audio("/sounds/correct.mp3");
}, []);
  

  useEffect(() => {
  setStatus("Performing...");
  setIsAdvancing(false);
  setShowCorrectTick(false);
}, [currentIndex]);

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraStarted(true);
        }
      } catch (error) {
        console.log(error);
        setCameraStarted(false);
      }
    }

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    async function setupHandLandmarker() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );

        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
          },
          runningMode: "VIDEO",
          numHands: 1,
        });

        setHandLandmarker(landmarker);
        setMediapipeReady(true);
      } catch (error) {
        console.log(error);
        setMediapipeReady(false);
      }
    }

    setupHandLandmarker();
  }, []);

  useEffect(() => {
    if (!handLandmarker || !videoRef.current) return;

    let animationFrameId = 0;
    let lastVideoTime = -1;

    const detect = async () => {
      const video = videoRef.current;

      if (video && video.readyState >= 2 && !video.paused) {
        if (video.currentTime !== lastVideoTime) {
          lastVideoTime = video.currentTime;

          const result = handLandmarker.detectForVideo(video, performance.now());

          if (result.landmarks && result.landmarks.length > 0) {
            setHandDetected(true);

            const hand = result.landmarks[0];
            const landmarks: number[] = [];

            for (const lm of hand) {
              landmarks.push(lm.x, lm.y, lm.z);
            }

            const prediction = await predictFromLandmarks(landmarks);

            if (prediction) {
              setPredictedLabel(prediction.label);
              setPredictionConfidence(prediction.confidence);
            } else {
              setPredictedLabel("No Prediction");
              setPredictionConfidence(0);
            }
          } else {
            setHandDetected(false);
            setPredictedLabel("None");
            setPredictionConfidence(0);
          }
        }
      }

      animationFrameId = requestAnimationFrame(detect);
    };

    detect();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [handLandmarker]);
 
  const currentSign = lessonSigns[currentIndex];
  
  useEffect(() => {
  if (modelStatus !== "Loaded") return;
  if (!handDetected) {
    setStatus("Performing...");
    return;
  }
  if (isAdvancing) return;
  if (!currentSign || !predictedLabel) return;

  const expectedLabel = String(
    (currentSign as any).modelLabel
  ).trim().toLowerCase();

  const actualLabel = String(predictedLabel).trim().toLowerCase();

  const isCorrectCurrentSign =
    actualLabel === expectedLabel && predictionConfidence >= 0.99;

  if (isCorrectCurrentSign) {
  setStatus("Correct!");

  if (correctSoundRef.current) {
    correctSoundRef.current.currentTime = 0;
    correctSoundRef.current.play().catch(() => {});
  }
  setShowCorrectTick(true);

  setIsAdvancing(true);
} else {
    setStatus("Try Again");
  }
}, [
  predictedLabel,
  predictionConfidence,
  handDetected,
  modelStatus,
  isAdvancing,
  currentSign,
]);

useEffect(() => {
  if (!isAdvancing) return;

  const timer = setTimeout(() => {
    handleNext();
  }, 800);

  return () => clearTimeout(timer);
}, [isAdvancing]);

  if (!lessonSigns) {
    return <div className="p-10 text-white">Lesson not found</div>;
  }

  

  async function handleNext() {
    if (currentIndex < lessonSigns.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      try {
        if (auth.currentUser) {
          await setDoc(
            doc(db, "users", auth.currentUser.uid, "progress", "lessons"),
            {
              [`lesson${lessonId}`]: true,
            },
            { merge: true }
          );
        }

        alert("Lesson Completed!");
        router.push("/learning");
      } catch (error: any) {
        alert(error.message);
      }
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen w-full bg-gradient-to-br from-[var(--theme-main)] via-[var(--theme-main)] to-white px-6 py-10">
        <div className="mx-auto w-full max-w-7xl">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push("/learning")}
              className="rounded-xl bg-white px-5 py-2 font-bold text-[var(--theme-main)]"
            >
              ← Back
            </button>

            <h2 className="text-2xl font-bold text-white">
              Lesson {lessonId} ({currentIndex + 1}/5)
            </h2>

            <div />
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="rounded-3xl bg-white/20 p-8 shadow-xl backdrop-blur-md">
              <div className="h-80 w-full overflow-hidden rounded-2xl bg-white/70">
                <img
                  src={currentSign.imagePath}
                  alt={currentSign.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>

              <h3 className="mt-6 text-3xl font-bold text-white">
                {currentSign.name}
              </h3>

              <p className="mt-3 text-lg text-white/90">
                {currentSign.meaning}
              </p>
            </div>

            <div className="rounded-3xl bg-white/20 p-8 shadow-xl backdrop-blur-md">
              <div className="relative h-80 w-full overflow-hidden rounded-2xl bg-black/30">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full object-cover"
                />

                {showCorrectTick && (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
    <div className="animate-pop">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-500 text-5xl text-white shadow-lg">
        ✓
      </div>
    </div>
  </div>
)}

                {!cameraStarted && (
                  <div className="absolute inset-0 flex items-center justify-center text-white font-semibold">
                    Allow camera access...
                  </div>
                )}
              </div>

              <div className="mt-6 rounded-2xl bg-white/80 px-6 py-4 text-center text-lg font-bold text-[var(--theme-main)]">
                {status}

                

                <div className="mt-1 text-sm text-gray-600">
                  Hand: {handDetected ? "Detected" : "Not Detected"}
                </div>

                

                

                <div className="mt-1 text-sm text-gray-600">
                  Confidence: {(predictionConfidence * 100).toFixed(1)}%
                </div>
              </div>

              <button
                onClick={async () => {
                  try {
                    await loadOnnxModel();
                    setModelStatus("Loaded");
                  } catch (error) {
                    console.log(error);
                    setModelStatus("Failed");
                  }
                }}
                className="mt-4 w-full rounded-xl bg-white py-3 font-bold text-[var(--theme-main)]"
              >
                Start
              </button>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}