"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The exported ONNX graph already ends in Softmax, so `confidence` really is a
 * probability. The old gate demanded >= 0.99 on a single frame, which is why a
 * sign was only ever accepted when the hand was close to the camera and almost
 * perfectly posed.
 *
 * Instead we accept a lower per-frame probability but require the prediction to
 * stay stable for a short hold. That is far more forgiving of distance and
 * framing without letting a stray frame count as a correct answer.
 */
export const MATCH_CONFIDENCE = 0.85;
export const MATCH_HOLD_MS = 450;

export type MatchState = "idle" | "waiting" | "holding" | "wrong";

type Options = {
  expectedLabel?: string;
  predictedLabel: string;
  confidence: number;
  handDetected: boolean;
  /** False while the model is still loading, or the page is mid-advance. */
  enabled: boolean;
  onMatch: () => void;
};

function normalise(label: unknown) {
  return String(label ?? "").trim().toLowerCase();
}

export function useStableSignMatch({
  expectedLabel,
  predictedLabel,
  confidence,
  handDetected,
  enabled,
  onMatch,
}: Options): MatchState {
  const [state, setState] = useState<MatchState>("idle");

  // Keeps the callback fresh without restarting the hold timer every render.
  const onMatchRef = useRef(onMatch);
  useEffect(() => {
    onMatchRef.current = onMatch;
  }, [onMatch]);

  const expected = normalise(expectedLabel);
  const actual = normalise(predictedLabel);
  const matches =
    enabled &&
    handDetected &&
    expected.length > 0 &&
    actual === expected &&
    confidence >= MATCH_CONFIDENCE;

  // `matches` is a boolean, so confidence drifting between (say) 0.87 and 0.92
  // does not re-run this effect and does not restart the hold. The timer is
  // only cancelled when the match genuinely breaks, or the target sign changes.
  useEffect(() => {
    if (!enabled) {
      setState("idle");
      return;
    }

    if (!handDetected) {
      setState("waiting");
      return;
    }

    if (!matches) {
      setState("wrong");
      return;
    }

    setState("holding");

    const timer = setTimeout(() => {
      onMatchRef.current();
    }, MATCH_HOLD_MS);

    return () => clearTimeout(timer);
  }, [enabled, handDetected, matches, expected]);

  return state;
}

export function matchStatusText(state: MatchState): string {
  switch (state) {
    case "holding":
      return "Hold it there…";
    case "wrong":
      return "Try again";
    case "waiting":
      return "Show your hand";
    default:
      return "Performing…";
  }
}
