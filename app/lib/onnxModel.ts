import * as ort from "onnxruntime-web";

let session: ort.InferenceSession | null = null;
let classNames: string[] = [];

export async function loadOnnxModel() {
  if (session) return;

  session = await ort.InferenceSession.create("/models/psl_model.onnx");

  const res = await fetch("/model-data/classes.json");
  classNames = await res.json();
}

export async function predictFromLandmarks(landmarks: number[]) {
  if (!session || landmarks.length !== 63) return null;

  const input = new ort.Tensor("float32", Float32Array.from(landmarks), [1, 63]);

  const feeds: Record<string, ort.Tensor> = {};
  feeds[session.inputNames[0]] = input;

  const results = await session.run(feeds);
  const output = results[session.outputNames[0]] as ort.Tensor;

  const data = output.data as Float32Array;

  let maxIndex = 0;
  for (let i = 1; i < data.length; i++) {
    if (data[i] > data[maxIndex]) {
      maxIndex = i;
    }
  }

  return {
    label: classNames[maxIndex],
    confidence: data[maxIndex],
  };
}