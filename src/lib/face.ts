'use client';

/**
 * face.ts — face-api.js utility layer
 *
 * All functions are client-side only (browser).
 * Models are served from /public/models/ as static Next.js assets.
 *
 * Strategy:
 *   - TinyFaceDetector  → fast lightweight face detection (~190 KB)
 *   - FaceLandmark68Net → landmarks for descriptor alignment (~357 KB)
 *   - FaceRecognitionNet → 128-float descriptor for identity matching (~6.3 MB)
 *
 * Descriptor matching:
 *   - Euclidean distance < FACE_MATCH_THRESHOLD (0.52) = same person
 *   - Industry standard for face-api.js applications
 */

import * as faceapi from '@vladmandic/face-api';

let modelsLoaded = false;
let loadingPromise: Promise<void> | null = null;

const MODEL_URL = '/models';

/** Load all required models once, cached for the session. */
export async function loadFaceModels(): Promise<void> {
  if (modelsLoaded) return;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    modelsLoaded = true;
  })();

  return loadingPromise;
}

/**
 * Detect a single face in the given video element and return its
 * 128-dimensional descriptor vector, or null if no face is detected.
 */
export async function captureFaceDescriptor(
  videoEl: HTMLVideoElement
): Promise<Float32Array | null> {
  const result = await faceapi
    .detectSingleFace(videoEl, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.5 }))
    .withFaceLandmarks()
    .withFaceDescriptor();

  return result?.descriptor ?? null;
}

/**
 * Euclidean distance between two 128-float descriptors.
 * Returns a number in [0, 2]. Values < threshold = same person.
 */
export function euclideanDistance(a: number[], b: number[]): number {
  return faceapi.euclideanDistance(a, b);
}

/** Threshold for face match (lower = stricter). 0.52 is a reliable default. */
export const FACE_MATCH_THRESHOLD = 0.52;

/**
 * Compare a live descriptor against the stored enrolled one.
 * Both args accept number[] or Float32Array for flexibility.
 */
export function isFaceMatch(
  liveDescriptor: Float32Array,
  storedDescriptor: number[]
): boolean {
  const distance = faceapi.euclideanDistance(
    Array.from(liveDescriptor),
    storedDescriptor
  );
  return distance < FACE_MATCH_THRESHOLD;
}

/**
 * Immediately stop all tracks in a video element's MediaStream
 * and clear srcObject to release the camera hardware.
 */
export function stopMediaStream(videoEl: HTMLVideoElement | null): void {
  if (!videoEl) return;
  if (videoEl.srcObject) {
    const stream = videoEl.srcObject as MediaStream;
    stream.getTracks().forEach((track) => track.stop());
    videoEl.srcObject = null;
  }
}
