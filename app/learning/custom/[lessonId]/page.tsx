"use client";

import { useRouter, useParams } from "next/navigation";
import AuthGuard from "@/components/common/AuthGuard";
import { useState, useEffect, useRef } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { loadOnnxModel, predictFromLandmarks } from "@/app/lib/onnxModel";
import {
  HandLandmarker,
  FilesetResolver,
} from "@mediapipe/tasks-vision";

export default function CustomLessonPage() {
  const router = useRouter();
  const params = useParams();

  const lessonId = String(params.lessonId);

  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [status, setStatus] = useState("Performing...");
  const [cameraStarted, setCameraStarted] = useState(false);
  const [mediapipeReady, setMediapipeReady] = useState(false);
  const [handDetected, setHandDetected] = useState(false);
  const [modelStatus, setModelStatus] = useState("Not Loaded");
  const [predictedLabel, setPredictedLabel] = useState("None");
  const [predictionConfidence, setPredictionConfidence] = useState(0);
  const [handLandmarker, setHandLandmarker] =
    useState<HandLandmarker | null>(null);
  const [isAdvancing, setIsAdvancing] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const correctSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    correctSoundRef.current = new Audio("/sounds/correct.mp3");
  }, []);

  useEffect(() => {
    async function loadLesson() {
      if (!auth.currentUser) return;

      try {
        const lessonRef = doc(
          db,
          "users",
          auth.currentUser.uid,
          "customLessons",
          lessonId
        );

        const snap = await getDoc(lessonRef);

        if (snap.exists()) {
          setLesson({
            id: snap.id,
            ...snap.data(),
          });
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }

    loadLesson();
  }, [lessonId]);

  const lessonSigns = lesson?.signs || [];
  const currentSign = lessonSigns[currentIndex];

  useEffect(() => {
    setStatus("Performing...");
    setIsAdvancing(false);
    setPredictedLabel("None");
    setPredictionConfidence(0);
    setHandDetected(false);
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
    if (
  !handLandmarker ||
  !videoRef.current ||
  !cameraStarted ||
  modelStatus !== "Loaded"
) return;

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
            
            setPredictedLabel(`Landmarks: ${landmarks.length}`);
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
  }, [handLandmarker, cameraStarted, modelStatus]);

  useEffect(() => {
    if (modelStatus !== "Loaded") return;
    if (!handDetected) {
      setStatus("Performing...");
      return;
    }
    if (isAdvancing) return;
    if (!currentSign || !currentSign.modelLabel || !predictedLabel) return;

    const expectedLabel = String(currentSign.modelLabel).trim().toLowerCase();
    const actualLabel = String(predictedLabel).trim().toLowerCase();

    const isCorrectCurrentSign =
      actualLabel === expectedLabel && predictionConfidence >= 0.99;

    if (isCorrectCurrentSign) {
      setStatus("Correct!");
      setIsAdvancing(true);

      if (correctSoundRef.current) {
        correctSoundRef.current.currentTime = 0;
        correctSoundRef.current.play().catch(() => {});
      }
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

  async function handleNext() {
    if (currentIndex < lessonSigns.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      try {
        if (auth.currentUser) {
          await setDoc(
            doc(db, "users", auth.currentUser.uid, "progress", "lessons"),
            {
              [`custom_${lessonId}`]: true,
            },
            { merge: true }
          );
        }

        alert("Custom Lesson Completed!");
        router.push("/learning");
      } catch (error: any) {
        alert(error.message);
      }
    }
  }

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen p-10 text-white">
          Loading custom lesson...
        </div>
      </AuthGuard>
    );
  }

  if (!lesson || !currentSign) {
    return (
      <AuthGuard>
        <div className="min-h-screen p-10 text-white">
          Custom lesson not found.
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen px-6 py-10">
        <div className="mx-auto w-full max-w-7xl">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push("/learning")}
              className="rounded-xl bg-white px-5 py-2 font-bold text-[var(--theme-main)]"
            >
              ← Back
            </button>

            <h2 className="text-2xl font-bold text-white">
              {lesson.title} ({currentIndex + 1}/{lessonSigns.length})
            </h2>

            <div />
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="rounded-3xl bg-white/20 p-8 shadow-xl backdrop-blur-md">
              <div className="h-80 w-full overflow-hidden rounded-2xl bg-white/70">
                <img
                  src={currentSign.imagePath}
                  alt={currentSign.modelLabel}
                  className="h-full w-full object-cover"
                />
              </div>

              <h3 className="mt-6 text-5xl font-bold text-white">
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

                {!cameraStarted && (
                  <div className="absolute inset-0 flex items-center justify-center font-semibold text-white">
                    Allow camera access...
                  </div>
                )}
              </div>

              <div className="mt-6 rounded-2xl bg-white/80 px-6 py-4 text-center text-lg font-bold text-[var(--theme-main)]">
                {status}

                <div className="mt-2 text-sm text-gray-600">
                  MediaPipe: {mediapipeReady ? "Loaded" : "Not Loaded"}
                </div>

                <div className="mt-1 text-sm text-gray-600">
                  Hand: {handDetected ? "Detected" : "Not Detected"}
                </div>

                <div className="mt-1 text-sm text-gray-600">
                  Model: {modelStatus}
                </div>

                <div className="mt-1 text-sm text-gray-600">
                  Prediction: {predictedLabel}
                </div>

                <div className="mt-1 text-sm text-gray-600">
                  Confidence: {(predictionConfidence * 100).toFixed(1)}%
                </div>
              </div>

              <button
                onClick={async () => {
  try {
    setPredictedLabel("None");
    setPredictionConfidence(0);
    setHandDetected(false);

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