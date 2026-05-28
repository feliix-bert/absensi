'use client';

/**
 * FaceVerificationStep.tsx
 *
 * Reusable face-verification component for the scan page.
 *
 * Flow:
 *   1. Camera starts (front-facing) on mount
 *   2. Models are loaded (cached after first load)
 *   3. User presses "Verifikasi Wajah" → descriptor captured → compared
 *   4. On match: camera stops, onVerified() called
 *   5. On mismatch: error shown, retry allowed (camera stays on)
 *   6. Camera is always stopped on unmount (cleanup)
 *
 * Privacy guarantees:
 *   - Camera ONLY runs while this component is mounted
 *   - Camera stops immediately on success, failure-final, or unmount
 *   - No images are stored or sent to any server
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanFace, ShieldCheck, ShieldX, Loader2, Camera, RefreshCw, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import {
  loadFaceModels,
  captureFaceDescriptor,
  isFaceMatch,
  stopMediaStream,
} from '@/lib/face';

type VerifyState =
  | 'loading_models'   // face-api.js models downloading
  | 'ready'            // camera on, awaiting user action
  | 'capturing'        // descriptor being computed
  | 'verified'         // success
  | 'mismatch'         // wrong face
  | 'no_face'          // no face detected in frame
  | 'camera_denied'    // browser permission rejected
  | 'not_enrolled';    // storedDescriptor is null

interface FaceVerificationStepProps {
  /** The 128-float stored descriptor from profiles. null = not enrolled. */
  storedDescriptor: number[] | null;
  /** Called when the user is successfully verified. */
  onVerified: () => void;
}

export function FaceVerificationStep({ storedDescriptor, onVerified }: FaceVerificationStepProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [verifyState, setVerifyState] = useState<VerifyState>(
    storedDescriptor === null ? 'not_enrolled' : 'loading_models'
  );
  const [attemptCount, setAttemptCount] = useState(0);

  // ── Start camera (front-facing) ───────────────────────────────────────
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setVerifyState('camera_denied');
    }
  }, []);

  // ── Load models + start camera on mount ───────────────────────────────
  useEffect(() => {
    if (storedDescriptor === null) return; // show not_enrolled UI, no camera needed

    let cancelled = false;

    (async () => {
      try {
        await loadFaceModels();
        if (cancelled) return;
        await startCamera();
        if (cancelled) return;
        setVerifyState('ready');
      } catch {
        if (!cancelled) setVerifyState('camera_denied');
      }
    })();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) stopMediaStream(videoRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Verify button handler ─────────────────────────────────────────────
  const handleVerify = async () => {
    if (!videoRef.current || !storedDescriptor) return;
    setVerifyState('capturing');

    try {
      const descriptor = await captureFaceDescriptor(videoRef.current);

      if (!descriptor) {
        setVerifyState('no_face');
        return;
      }

      const matched = isFaceMatch(descriptor, storedDescriptor);

      if (matched) {
        // Stop camera immediately — privacy first
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
        stopMediaStream(videoRef.current);
        setVerifyState('verified');

        // Give the success animation a moment then hand off
        setTimeout(() => onVerified(), 900);
      } else {
        setAttemptCount((c) => c + 1);
        setVerifyState('mismatch');
      }
    } catch {
      setAttemptCount((c) => c + 1);
      setVerifyState('mismatch');
    }
  };

  const handleRetry = () => {
    setVerifyState('ready');
  };

  // ── Derived UI helpers ─────────────────────────────────────────────────
  const isCapturing = verifyState === 'capturing';
  const showVideo = verifyState === 'loading_models' || verifyState === 'ready' || verifyState === 'capturing' || verifyState === 'no_face' || verifyState === 'mismatch';

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-sm mx-auto">

      {/* ── Title ── */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <ScanFace size={20} className="text-primary-600" />
          <h2 className="text-neutral-900 font-bold text-body-lg">Verifikasi Wajah</h2>
        </div>
        <p className="text-neutral-500 text-body-sm">
          {verifyState === 'not_enrolled'
            ? 'Wajah belum terdaftar'
            : verifyState === 'verified'
            ? 'Wajah terverifikasi!'
            : 'Arahkan wajah ke kamera lalu tekan tombol verifikasi'}
        </p>
      </div>

      {/* ── Camera frame ── */}
      {showVideo && (
        <div className="relative rounded-2xl overflow-hidden bg-black shadow-xl ring-4 ring-white w-full aspect-square max-w-[280px]">
          <video
            ref={videoRef}
            muted
            playsInline
            className="w-full h-full object-cover scale-x-[-1]" // Mirror for selfie feel
          />

          {/* Loading overlay */}
          <AnimatePresence>
            {verifyState === 'loading_models' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3"
              >
                <Loader2 size={28} className="text-white animate-spin" />
                <p className="text-white text-sm font-medium">Memuat model wajah...</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Face guide oval overlay */}
          {(verifyState === 'ready' || verifyState === 'no_face' || verifyState === 'mismatch') && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className={`w-40 h-52 rounded-full border-4 transition-colors duration-300
                  ${verifyState === 'mismatch' ? 'border-danger-400' : verifyState === 'no_face' ? 'border-warning-400' : 'border-white/50'}`}
              />
            </div>
          )}

          {/* Capturing pulse */}
          <AnimatePresence>
            {isCapturing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/20 flex items-center justify-center"
              >
                <Loader2 size={32} className="text-white animate-spin" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── Success state ── */}
      <AnimatePresence>
        {verifyState === 'verified' && (
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 16 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="w-24 h-24 rounded-full bg-success-500 flex items-center justify-center shadow-lg">
              <ShieldCheck size={44} className="text-white" />
            </div>
            <p className="text-success-700 font-bold text-center">Wajah berhasil dikenali!</p>
            <p className="text-neutral-500 text-body-sm text-center">Membuka scanner QR...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Not enrolled state ── */}
      {verifyState === 'not_enrolled' && (
        <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-warning-50 border border-warning-200 w-full">
          <div className="w-16 h-16 rounded-full bg-warning-100 flex items-center justify-center">
            <ShieldX size={32} className="text-warning-600" />
          </div>
          <div className="text-center">
            <p className="font-bold text-neutral-900 mb-1">Wajah Belum Terdaftar</p>
            <p className="text-neutral-500 text-body-sm leading-relaxed">
              Kamu belum mendaftarkan wajah. Daftarkan wajah terlebih dahulu untuk bisa absen.
            </p>
          </div>
          <Link
            href="/face-enrollment"
            className="btn btn-primary btn-full flex items-center justify-center gap-2"
          >
            <Camera size={16} />
            Daftarkan Wajah Sekarang
            <ExternalLink size={14} />
          </Link>
        </div>
      )}

      {/* ── Camera denied state ── */}
      {verifyState === 'camera_denied' && (
        <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-danger-50 border border-danger-200 w-full text-center">
          <ShieldX size={32} className="text-danger-500" />
          <p className="font-bold text-neutral-900">Izin Kamera Ditolak</p>
          <p className="text-neutral-500 text-body-sm leading-relaxed">
            Akses kamera diperlukan untuk verifikasi wajah. Izinkan akses kamera di pengaturan browser dan muat ulang halaman.
          </p>
        </div>
      )}

      {/* ── Error messages ── */}
      <AnimatePresence>
        {verifyState === 'no_face' && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="px-4 py-2.5 rounded-xl bg-warning-50 border border-warning-200 text-warning-700 text-body-sm font-medium text-center w-full"
          >
            Wajah tidak terdeteksi. Pastikan wajahmu terlihat jelas dan pencahayaan cukup.
          </motion.div>
        )}
        {verifyState === 'mismatch' && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="px-4 py-2.5 rounded-xl bg-danger-50 border border-danger-200 text-danger-700 text-body-sm font-medium text-center w-full"
          >
            Wajah tidak dikenali{attemptCount > 1 ? ` (percobaan ke-${attemptCount})` : ''}. Pastikan pencahayaan baik dan wajah menghadap langsung ke kamera.
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Action buttons ── */}
      {(verifyState === 'ready' || verifyState === 'no_face' || verifyState === 'mismatch') && (
        <div className="flex flex-col gap-2.5 w-full">
          <button
            onClick={handleVerify}
            disabled={isCapturing}
            className="btn btn-primary btn-full btn-lg flex items-center justify-center gap-2"
          >
            <ScanFace size={18} />
            {verifyState === 'mismatch' || verifyState === 'no_face' ? 'Coba Lagi' : 'Verifikasi Wajah'}
          </button>
          {(verifyState === 'mismatch' || verifyState === 'no_face') && (
            <button
              onClick={handleRetry}
              className="btn btn-ghost btn-full flex items-center justify-center gap-2 text-neutral-500"
            >
              <RefreshCw size={15} />
              Reset Kamera
            </button>
          )}
        </div>
      )}

      {verifyState === 'capturing' && (
        <div className="flex items-center gap-2 text-neutral-500 text-body-sm">
          <Loader2 size={16} className="animate-spin" />
          Menganalisis wajah...
        </div>
      )}
    </div>
  );
}
