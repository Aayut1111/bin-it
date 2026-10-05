import { pixelate } from "./pixelate";

// The face detector runs inside the browser, so the photo never leaves the
// phone to be checked. It is loaded only when someone picks a photo.
const BUNDLE_URL =
  import.meta.env.VITE_FACE_BUNDLE_URL ||
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/vision_bundle.mjs";
const WASM_URL =
  import.meta.env.VITE_FACE_WASM_URL ||
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm";
const MODEL_URL =
  import.meta.env.VITE_FACE_MODEL_URL ||
  "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite";

let detectorPromise = null;

function getDetector() {
  if (!detectorPromise) {
    detectorPromise = (async () => {
      const { FaceDetector, FilesetResolver } = await import(/* @vite-ignore */ BUNDLE_URL);
      const fileset = await FilesetResolver.forVisionTasks(WASM_URL);
      return FaceDetector.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: MODEL_URL },
        runningMode: "IMAGE",
        minDetectionConfidence: 0.4, // low on purpose: better to blur too much than too little
      });
    })();
    detectorPromise.catch(() => {
      detectorPromise = null; // allow a retry next time
    });
  }
  return detectorPromise;
}

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms)),
  ]);
}

// Finds faces in the canvas and mosaics them in place.
// Returns how many were blurred. Throws if detection isn't available.
export async function blurFaces(canvas) {
  const detector = await withTimeout(getDetector(), 20000);
  const { detections } = detector.detect(canvas);
  const ctx = canvas.getContext("2d");

  for (const d of detections) {
    const box = d.boundingBox;
    const pad = Math.max(box.width, box.height) * 0.25; // cover hair line and chin
    const w = box.width + pad * 2;
    const h = box.height + pad * 2;
    pixelate(ctx, box.originX - pad, box.originY - pad, w, h, Math.max(10, Math.max(w, h) / 6));
  }
  return detections.length;
}