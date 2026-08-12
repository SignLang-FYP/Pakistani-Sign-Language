"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import AuthGuard from "@/components/common/AuthGuard";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { loadOnnxModel } from "@/app/lib/onnxModel";
import { startHandDetectionLoop } from "@/app/lib/handDetectionLoop";
import {
  useStableSignMatch,
  matchStatusText,
} from "@/app/lib/useStableSignMatch";
import { useModal } from "@/components/common/ModalProvider";
import { useCurrentUser } from "@/components/common/useCurrentUser";
import PageHeader from "@/components/common/PageHeader";
import SignPanel from "@/components/practice/SignPanel";
import CameraPanel from "@/components/practice/CameraPanel";
import {
  HandLandmarker,
  FilesetResolver,
} from "@mediapipe/tasks-vision";

export default function CustomEvaluationPage() {
  const router = useRouter();
  const modal = useModal();
  const params = useParams();
  const { user } = useCurrentUser();

  const testId = String(params.testId);

  const [test, setTest] = useState<any>(null);
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

  const [timeLeft, setTimeLeft] = useState(10);
  const [score, setScore] = useState(0);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [pendingResult, setPendingResult] = useState<boolean | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const wrongSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    wrongSoundRef.current = new Audio("/sounds/wrong.mp3");
  }, []);

  useEffect(() => {
    async function loadCustomTest() {
      if (!user) return;

      try {
        const testRef = doc(
          db,
          "users",
          user.uid,
          "customTests",
          testId
        );

        const snap = await getDoc(testRef);

        if (snap.exists()) {
          setTest({
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

    loadCustomTest();
  }, [testId, user]);

  const testSigns = test?.signs || [];
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
    ) {
      return;
    }

    return startHandDetectionLoop({
      handLandmarker,
      getVideo: () => videoRef.current,
      onUpdate: ({ handDetected, label, confidence }) => {
        setHandDetected(handDetected);
        setPredictedLabel(label);
        setPredictionConfidence(confidence);
      },
    });
  }, [handLandmarker, cameraStarted, modelStatus]);

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
    expectedLabel: currentSign?.modelLabel,
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
    const newScore = correct ? score + 1 : score;

    if (correct) {
      setScore((prev) => prev + 1);
    }

    if (currentIndex < testSigns.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      try {
        if (auth.currentUser) {
          await setDoc(
            doc(db, "users", auth.currentUser.uid, "progress", "tests"),
            {
              [`custom_${testId}`]: {
                score: newScore,
                total: testSigns.length,
              },
            },
            { merge: true }
          );
        }

        await modal.success(
          `You scored ${newScore} out of ${testSigns.length}.`,
          "Test completed"
        );
        router.push("/evaluation");
      } catch (error: any) {
        await modal.error(error.message);
      }
    }
  }

  if (loading) {
    return (
      <AuthGuard>
        <div className="flex min-h-screen items-center justify-center">
          <p className="faint text-sm">Loading custom test…</p>
        </div>
      </AuthGuard>
    );
  }

  if (!test || !currentSign) {
    return (
      <AuthGuard>
        <div className="flex min-h-screen items-center justify-center">
          <p className="muted text-sm">Custom test not found.</p>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="page">
        <div className="shell">
          <PageHeader
            eyebrow={`Sign ${currentIndex + 1} of ${testSigns.length}`}
            title={test.title}
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
              predictedLabel={predictedLabel}
              mediapipeReady={mediapipeReady}
              onStart={async () => {
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
            />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
