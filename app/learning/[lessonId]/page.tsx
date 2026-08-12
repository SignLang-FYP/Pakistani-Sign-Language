"use client";

import { useRouter, useParams } from "next/navigation";
import AuthGuard from "@/components/common/AuthGuard";
import { lessons } from "@/data/lessons";
import { useState, useEffect, useRef } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { loadOnnxModel } from "@/app/lib/onnxModel";
import { startHandDetectionLoop } from "@/app/lib/handDetectionLoop";
import {
  useStableSignMatch,
  matchStatusText,
} from "@/app/lib/useStableSignMatch";
import { useModal } from "@/components/common/ModalProvider";
import PageHeader from "@/components/common/PageHeader";
import SignPanel from "@/components/practice/SignPanel";
import CameraPanel from "@/components/practice/CameraPanel";
import {
  HandLandmarker,
  FilesetResolver,
} from "@mediapipe/tasks-vision";

export default function LessonDetailPage() {
  const router = useRouter();
  const modal = useModal();
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

    return startHandDetectionLoop({
      handLandmarker,
      getVideo: () => videoRef.current,
      onUpdate: ({ handDetected, label, confidence }) => {
        setHandDetected(handDetected);
        setPredictedLabel(label);
        setPredictionConfidence(confidence);
      },
    });
  }, [handLandmarker]);

  const currentSign = lessonSigns?.[currentIndex];
  
  const matchState = useStableSignMatch({
    expectedLabel: (currentSign as any)?.modelLabel,
    predictedLabel,
    confidence: predictionConfidence,
    handDetected,
    enabled: modelStatus === "Loaded" && !isAdvancing,
    onMatch: () => {
      setStatus("Correct!");

      if (correctSoundRef.current) {
        correctSoundRef.current.currentTime = 0;
        correctSoundRef.current.play().catch(() => {});
      }

      setShowCorrectTick(true);
      setIsAdvancing(true);
    },
  });

  useEffect(() => {
    if (isAdvancing) return;
    setStatus(matchStatusText(matchState));
  }, [matchState, isAdvancing]);

useEffect(() => {
  if (!isAdvancing) return;

  const timer = setTimeout(() => {
    handleNext();
  }, 800);

  return () => clearTimeout(timer);
}, [isAdvancing]);

  if (!lessonSigns) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="muted text-sm">Lesson not found.</p>
      </div>
    );
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

        await modal.success("Lesson Completed!", "Well done");
        router.push("/learning");
      } catch (error: any) {
        await modal.error(error.message);
      }
    }
  }

  return (
    <AuthGuard>
      <div className="page">
        <div className="shell">
          <PageHeader
            eyebrow={`Sign ${currentIndex + 1} of ${lessonSigns.length}`}
            title={`Lesson ${lessonId}`}
            backHref="/learning"
          />

          <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <SignPanel
              name={currentSign.name}
              meaning={currentSign.meaning}
              imagePath={currentSign.imagePath}
            />

            <CameraPanel
              videoRef={videoRef}
              cameraStarted={cameraStarted}
              status={status}
              handDetected={handDetected}
              predictionConfidence={predictionConfidence}
              modelStatus={modelStatus}
              showCorrectTick={showCorrectTick}
              mediapipeReady={mediapipeReady}
              onStart={async () => {
                try {
                  await loadOnnxModel();
                  setModelStatus("Loaded");
                } catch (error) {
                  console.log(error);
                  setModelStatus("Failed");
                }
              }}
            />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
