'use client';

/**
 * /face-enrollment — Face enrollment page
 *
 * Shown after signup completes (auth.actions.ts redirects here).
 * Flow:
 *   1. Camera starts (front-facing, selfie)
 *   2. User positions face in the oval guide
 *   3. "Ambil Foto Wajah" → captures descriptor → saves to profiles
 *   4. Camera stops → redirect to /dashboard
 *
 * Privacy: Camera stops immediately after capture. No image stored.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Camera, ScanFace, CheckCircle2, AlertCircle,
  Loader2, ShieldCheck, ArrowRight, RefreshCw
} from 'lucide-react';
import {
  loadFaceModels,
  captureFaceDescriptor,
  stopMediaStream,
} from '@/lib/face';
import { saveFaceDescriptor } from '@/actions/face.actions';
import { useAuthStore } from '@/features/auth/store/authStore';

type EnrollState =
  | 'loading'       // models + camera starting
  | 'ready'         // camera on, awaiting capture
  | 'capturing'     // computing descriptor
  | 'saving'        // server action in flight
  | 'success'       // enrolled!
  | 'no_face'       // no face detected — retry
  | 'save_error'    // server save failed
  | 'camera_denied';// browser permission denied

export default function FaceEnrollmentPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [enrollState, setEnrollState] = useState<EnrollState>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  // ── Start camera ────────────────────────────────────────────────────
  const startCamera = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      return true;
    } catch {
      setEnrollState('camera_denied');
      return false;
    }
  }, []);

  // ── Stop camera ──────────────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    stopMediaStream(videoRef.current);
  }, []);

  // ── Init on mount ───────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadFaceModels();
        if (cancelled) return;
        const ok = await startCamera();
        if (cancelled) return;
        if (ok) setEnrollState('ready');
      } catch {
        if (!cancelled) setEnrollState('camera_denied');
      }
    })();

    return () => {
      cancelled = true;
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Capture & save ──────────────────────────────────────────────────
  const handleCapture = async () => {
    if (!videoRef.current) return;
    setEnrollState('capturing');
    setErrorMsg('');

    try {
      const descriptor = await captureFaceDescriptor(videoRef.current);

      if (!descriptor) {
        setEnrollState('no_face');
        return;
      }

      setEnrollState('saving');

      const result = await saveFaceDescriptor(Array.from(descriptor));

      if (result.error) {
        setErrorMsg(result.error);
        setEnrollState('save_error');
        return;
      }

      // Force refresh the auth store so profile gets the new face_descriptor!
      await useAuthStore.getState().refreshProfile();

      // Stop camera — enrollment done
      stopCamera();
      setEnrollState('success');

      // Redirect to dashboard after a brief success animation
      setTimeout(() => router.push('/dashboard'), 2000);
    } catch (err) {
      setErrorMsg('An unexpected error occurred. Try again.');
      setEnrollState('save_error');
    }
  };

  const handleRetry = async () => {
    setErrorMsg('');
    // If camera was stopped (save_error), restart it
    if (!streamRef.current) {
      setEnrollState('loading');
      const ok = await startCamera();
      if (ok) setEnrollState('ready');
    } else {
      setEnrollState('ready');
    }
  };

  const showVideo = ['loading', 'ready', 'capturing', 'no_face', 'save_error'].includes(enrollState);

  return (
    <div className="min-h-dvh bg-neutral-50 flex flex-col items-center justify-center px-4 py-8 safe-top safe-bottom">

      {/* ── Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm card-modern p-7"
      >
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center mb-3 shadow-md">
            <ScanFace size={22} className="text-white" />
          </div>
          <h1 className="text-heading-xl text-neutral-900">Enroll Face</h1>
          <p className="text-body-sm text-neutral-500 mt-1 leading-relaxed max-w-[260px]">
            {enrollState === 'success'
              ? 'Face enrolled successfully!'
              : 'Position your face inside the circle then press the button below.'}
          </p>
        </div>

        {/* Progress steps */}
        <div className="flex items-center gap-2 mb-6">
          {['Account created', 'Enroll face'].map((label, i) => (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                ${i === 0 ? 'bg-success-500 text-white' : 'bg-primary-600 text-white'}`}>
                {i === 0 ? <CheckCircle2 size={14} /> : '2'}
              </div>
              <span className={`text-[11px] font-semibold flex-1 ${i === 1 ? 'text-primary-600' : 'text-neutral-400'}`}>
                {label}
              </span>
              {i < 1 && <div className="h-px flex-1 bg-success-300" />}
            </div>
          ))}
        </div>

        {/* Camera view */}
        {showVideo && (
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-square mb-5 shadow-lg">
            <video
              ref={videoRef}
              muted
              playsInline
              className="w-full h-full object-cover scale-x-[-1]"
            />

            {/* Face oval guide */}
            {(enrollState === 'ready' || enrollState === 'no_face' || enrollState === 'save_error') && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className={`w-44 h-56 rounded-full border-4 transition-colors duration-300
                  ${enrollState === 'no_face' ? 'border-warning-400' : 'border-white/60'}`}
                />
              </div>
            )}

            {/* Loading overlay */}
            <AnimatePresence>
              {enrollState === 'loading' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center gap-3"
                >
                  <Loader2 size={28} className="text-white animate-spin" />
                  <p className="text-white text-sm font-medium">Preparing camera...</p>
                </motion.div>
              )}
              {enrollState === 'capturing' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white/25 flex items-center justify-center"
                >
                  <Loader2 size={32} className="text-white animate-spin" />
                </motion.div>
              )}
              {enrollState === 'saving' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2"
                >
                  <Loader2 size={28} className="text-primary-400 animate-spin" />
                  <p className="text-white text-sm font-medium">Saving face data...</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Success state */}
        <AnimatePresence>
          {enrollState === 'success' && (
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 220, damping: 15 }}
              className="flex flex-col items-center gap-4 py-6 mb-5"
            >
              <div className="relative">
                <div className="w-28 h-28 rounded-full bg-success-500 flex items-center justify-center shadow-lg">
                  <ShieldCheck size={52} className="text-white" />
                </div>
                <motion.div
                  className="absolute inset-0 rounded-full bg-success-400"
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 1.7, opacity: 0 }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                />
              </div>
              <div className="text-center">
                <p className="font-bold text-neutral-900 text-lg">Face Enrolled Successfully!</p>
                <p className="text-neutral-500 text-body-sm mt-1">Redirecting to dashboard...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Camera denied */}
        {enrollState === 'camera_denied' && (
          <div className="flex flex-col items-center gap-3 p-5 rounded-xl bg-danger-50 border border-danger-200 mb-5 text-center">
            <AlertCircle size={28} className="text-danger-500" />
            <div>
              <p className="font-bold text-neutral-900 mb-1">Camera Permission Denied</p>
              <p className="text-neutral-500 text-body-sm leading-relaxed">
                Allow camera access in browser settings, then reload this page.
              </p>
            </div>
          </div>
        )}

        {/* Error messages */}
        <AnimatePresence>
          {enrollState === 'no_face' && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-2.5 p-3 rounded-xl bg-warning-50 border border-warning-200 mb-4"
            >
              <AlertCircle size={16} className="text-warning-600 shrink-0 mt-0.5" />
              <p className="text-warning-700 text-body-sm leading-relaxed">
                No face detected. Ensure your face is clearly visible, well-lit, and unobstructed.
              </p>
            </motion.div>
          )}
          {enrollState === 'save_error' && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-2.5 p-3 rounded-xl bg-danger-50 border border-danger-200 mb-4"
            >
              <AlertCircle size={16} className="text-danger-500 shrink-0 mt-0.5" />
              <p className="text-danger-700 text-body-sm leading-relaxed">
                {errorMsg || 'Failed to save face data. Try again.'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        {enrollState === 'ready' && (
          <button
            onClick={handleCapture}
            className="btn btn-primary btn-full btn-lg flex items-center justify-center gap-2"
            id="face-enroll-capture"
          >
            <Camera size={18} />
            Capture Face Photo
          </button>
        )}

        {(enrollState === 'no_face' || enrollState === 'save_error') && (
          <button
            onClick={handleRetry}
            className="btn btn-primary btn-full btn-lg flex items-center justify-center gap-2"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        )}

        {(enrollState === 'loading' || enrollState === 'capturing' || enrollState === 'saving') && (
          <div className="flex items-center justify-center gap-2 py-3 text-neutral-500 text-body-sm">
            <Loader2 size={16} className="animate-spin" />
            {enrollState === 'loading' && 'Loading...'}
            {enrollState === 'capturing' && 'Analyzing face...'}
            {enrollState === 'saving' && 'Saving...'}
          </div>
        )}

        {/* Skip link — for users who want to enroll later */}
        {enrollState !== 'success' && (
          <div className="mt-5 pt-5 border-t border-neutral-100 text-center">
            <Link
              href="/dashboard"
              className="text-neutral-400 text-body-sm hover:text-neutral-600 transition-colors inline-flex items-center gap-1"
            >
              Skip for now, enroll later
              <ArrowRight size={13} />
            </Link>
            <p className="text-neutral-400 text-[11px] mt-1">
              (You cannot check in without enrolling your face)
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
