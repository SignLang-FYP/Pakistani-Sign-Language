"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import AuthGuard from "@/components/common/AuthGuard";
import { tests } from "@/data/tests";
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

export default function EvaluationDetailPage() {
  const router = useRouter();
  const modal = useModal();
  const params = useParams();

  const testId = Number(params.testId);
  const testSigns = tests[testId as keyof typeof tests];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [status, setStatus] = useState("Performing...");
  const [cameraStarted, setCameraStarted] = useState(false);
  const [mediapipeReady, setMediapipeReady] = useState(false);
  const [handDetected, setHandDetected] = useState(false);
  const [modelStatus, setModelStatus] = useState("Not Loaded");
  const [predictedLabel, setPredictedLabel] = useState("None");
  const [predictionConfidence, setPredictionConfidence] = useState(0);
  const [handLandmarker, setHandLandmarker] = useState<HandLandmarker | null>(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const [score, setScore] = useState(0);
  const [isAdvancing, setIsAdvancing] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const wrongSoundRef = useRef<HTMLAudioElement | null>(null);
  const [pendingResult, setPendingResult] = useState<boolean | null>(null);

  if (!testSigns) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="muted text-sm">Test not found.</p>
      </div>
    );
  }

  const currentSign = testSigns[currentIndex];

  useEffect(() => {
  setStatus("Performing...");
  setIsAdvancing(false);
  setPendingResult(null);
  setTimeLeft(10);
  setPredictedLabel("None");
  setPredictionConfidence(0);
  setHandDetected(false);
}, [currentIndex]);     

  useEffect(() => {
  wrongSoundRef.current = new Audio("/sounds/wrong.mp3");
}, []);

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

  useEffect(() => {
  if (modelStatus !== "Loaded") return;
  if (isAdvancing) return;

  const timer = setInterval(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
  clearInterval(timer);

  if (wrongSoundRef.current) {
    wrongSoundRef.current.currentTime = 0;
    wrongSoundRef.current.play().catch(() => {});
  }

  setIsAdvancing(true);
  setPendingResult(false);
  return 0;
}
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [currentIndex, isAdvancing, modelStatus]);

  const matchState = useStableSignMatch({
    expectedLabel: (currentSign as any)?.modelLabel,
    predictedLabel,
    confidence: predictionConfidence,
    handDetected,
    enabled: modelStatus === "Loaded" && !isAdvancing,
    onMatch: () => {
      setStatus("Correct!");
      setIsAdvancing(true);
      setPendingResult(true);
    },
  });

  useEffect(() => {
    if (isAdvancing) return;
    setStatus(matchStatusText(matchState));
  }, [matchState, isAdvancing]);


  useEffect(() => {
  if (pendingResult === null) return;

  const timer = setTimeout(() => {
    handleNext(pendingResult);
  }, 800);

  return () => clearTimeout(timer);
}, [pendingResult]);

  async function handleNext(correct: boolean) {
    if (correct) {
      setScore((prev) => prev + 1);
    }

    if (currentIndex < testSigns.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      const finalScore = correct ? score + 1 : score;

      try {
        if (auth.currentUser) {
          await setDoc(
            doc(db, "users", auth.currentUser.uid, "progress", "tests"),
            {
              [`test${testId}`]: {
                score: finalScore,
                total: testSigns.length,
              },
            },
            { merge: true }
          );
        }

        await modal.success(
          `You scored ${finalScore} out of ${testSigns.length}.`,
          "Test completed"
        );
        router.push("/evaluation");
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
            eyebrow={`Sign ${currentIndex + 1} of ${testSigns.length}`}
            title={`Test ${testId}`}
            backHref="/evaluation"
            actions={<span className="tag">Score {score}</span>}
          />

          <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <SignPanel
              name={currentSign.name}
              meaning={currentSign.meaning}
              timeLeft={timeLeft}
            />

            <CameraPanel
              videoRef={videoRef}
              cameraStarted={cameraStarted}
              status={status}
              handDetected={handDetected}
              predictionConfidence={predictionConfidence}
              modelStatus={modelStatus}
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
