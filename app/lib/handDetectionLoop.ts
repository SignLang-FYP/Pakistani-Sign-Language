import type { HandLandmarker } from "@mediapipe/tasks-vision";
import { predictFromLandmarks } from "@/app/lib/onnxModel";

export type HandDetectionUpdate = {
  handDetected: boolean;
  label: string;
  confidence: number;
};

type Options = {
  handLandmarker: HandLandmarker;
  getVideo: () => HTMLVideoElement | null;
  onUpdate: (update: HandDetectionUpdate) => void;
};

/**
 * Runs the MediaPipe -> ONNX detection loop against a <video> element.
 *
 * Two things matter here and both used to be missing:
 *   - `onUpdate` only fires when a value actually changed. Calling setState on
 *     every animation frame is what produced "Maximum update depth exceeded".
 *   - Only one inference is allowed in flight at a time. `predictFromLandmarks`
 *     is async and slower than a frame, so without this the loop stacks up
 *     overlapping calls that never drain.
 *
 * Returns a stop function; call it from the effect cleanup.
 */
export function startHandDetectionLoop({
  handLandmarker,
  getVideo,
  onUpdate,
}: Options): () => void {
  let animationFrameId = 0;
  let lastVideoTime = -1;
  let cancelled = false;
  let inferenceInFlight = false;

  let lastHandDetected: boolean | null = null;
  let lastLabel: string | null = null;
  let lastConfidence: number | null = null;

  const publish = (handDetected: boolean, label: string, confidence: number) => {
    if (cancelled) return;

    // Quantise so float jitter doesn't register as a change every frame.
    const rounded = Math.round(confidence * 1000) / 1000;

    if (
      handDetected === lastHandDetected &&
      label === lastLabel &&
      rounded === lastConfidence
    ) {
      return;
    }

    lastHandDetected = handDetected;
    lastLabel = label;
    lastConfidence = rounded;

    onUpdate({ handDetected, label, confidence: rounded });
  };

  const detect = async () => {
    const video = getVideo();

    if (
      video &&
      video.readyState >= 2 &&
      !video.paused &&
      video.currentTime !== lastVideoTime &&
      !inferenceInFlight
    ) {
      lastVideoTime = video.currentTime;

      const result = handLandmarker.detectForVideo(video, performance.now());

      if (result.landmarks && result.landmarks.length > 0) {
        const landmarks: number[] = [];

        for (const lm of result.landmarks[0]) {
          landmarks.push(lm.x, lm.y, lm.z);
        }

        inferenceInFlight = true;
        try {
          const prediction = await predictFromLandmarks(landmarks);

          if (prediction) {
            publish(true, prediction.label, prediction.confidence);
          } else {
            publish(true, "No Prediction", 0);
          }
        } catch (error) {
          console.log(error);
          publish(true, "No Prediction", 0);
        } finally {
          inferenceInFlight = false;
        }
      } else {
        publish(false, "None", 0);
      }
    }

    if (!cancelled) {
      animationFrameId = requestAnimationFrame(detect);
    }
  };

  detect();

  return () => {
    cancelled = true;
    cancelAnimationFrame(animationFrameId);
  };
}
