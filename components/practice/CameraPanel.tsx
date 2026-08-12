import type { RefObject } from "react";

type CameraPanelProps = {
  videoRef: RefObject<HTMLVideoElement | null>;
  cameraStarted: boolean;
  status: string;
  handDetected: boolean;
  predictionConfidence: number;
  modelStatus: string;
  onStart: () => void;
  showCorrectTick?: boolean;
  predictedLabel?: string;
  mediapipeReady?: boolean;
};

export default function CameraPanel({
  videoRef,
  cameraStarted,
  status,
  handDetected,
  predictionConfidence,
  modelStatus,
  onStart,
  showCorrectTick = false,
  predictedLabel,
  mediapipeReady,
}: CameraPanelProps) {
  const ready = modelStatus === "Loaded";

  return (
    <section className="card">
      <div className="relative h-72 w-full overflow-hidden rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface-2)]">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="h-full w-full object-cover"
        />

        {showCorrectTick && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="animate-pop flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent)] text-3xl text-white">
              ✓
            </div>
          </div>
        )}

        {!cameraStarted && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="muted text-sm">Allow camera access…</p>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-baseline justify-between gap-4">
        <p className="text-lg font-medium">{status}</p>
        <p className="faint text-[13px] tabular-nums">
          {(predictionConfidence * 100).toFixed(0)}% confidence
        </p>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-[var(--border)] pt-4 text-[13px]">
        <div className="flex justify-between gap-2">
          <dt className="faint">Hand</dt>
          <dd className={handDetected ? "text-[var(--accent)]" : "muted"}>
            {handDetected ? "Detected" : "Not detected"}
          </dd>
        </div>

        <div className="flex justify-between gap-2">
          <dt className="faint">Model</dt>
          <dd className={ready ? "text-[var(--accent)]" : "muted"}>
            {modelStatus}
          </dd>
        </div>

        {typeof mediapipeReady === "boolean" && (
          <div className="flex justify-between gap-2">
            <dt className="faint">Tracking</dt>
            <dd className={mediapipeReady ? "text-[var(--accent)]" : "muted"}>
              {mediapipeReady ? "Ready" : "Loading"}
            </dd>
          </div>
        )}

        {predictedLabel && (
          <div className="flex justify-between gap-2">
            <dt className="faint">Prediction</dt>
            <dd className="muted truncate">{predictedLabel}</dd>
          </div>
        )}
      </dl>

      <button
        onClick={onStart}
        disabled={ready}
        className="btn btn-primary btn-block mt-6"
      >
        {ready ? "Model loaded" : "Start"}
      </button>
    </section>
  );
}
