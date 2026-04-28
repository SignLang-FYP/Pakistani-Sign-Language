let model: any = null;
let classNames: string[] = [];

export async function loadModel() {
  if (model) return;

  // Load TensorFlow.js
  const tf = await import("@tensorflow/tfjs");

  // Load model (you will place it later)
  model = await tf.loadLayersModel("/models/model.json");

  // Load class labels
  const res = await fetch("/model-data/classes.json");
  classNames = await res.json();
}

export async function predictFromLandmarks(landmarks: number[]) {
  if (!model || landmarks.length !== 63) return null;

  const tf = await import("@tensorflow/tfjs");

  const input = tf.tensor2d([landmarks]);
  const output = model.predict(input);
  const data = await output.data();

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