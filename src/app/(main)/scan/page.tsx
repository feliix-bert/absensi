'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, CheckCircle2, XCircle, Clock,
  RotateCcw, Lightbulb, Info, MapPin, Loader2
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';
import { submitCheckIn } from '@/actions/attendance.actions';
import { useAuthStore } from '@/features/auth/store/authStore';
import { calculateDistance, getHighAccuracyLocation } from '@/features/attendance/utils/geo.utils';
import { FaceVerificationStep } from '@/components/shared/FaceVerificationStep';

const QRScannerComponent = dynamic(() => import('@/components/shared/QRScannerComponent').then(mod => mod.QRScannerComponent), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-neutral-300 rounded-2xl bg-neutral-50 shadow-sm">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-400 mb-4"></div>
      <p className="text-neutral-500 text-sm font-medium">Loading scanner...</p>
    </div>
  )
});

// face_pending is the new initial gate — must pass before GPS/QR flow starts.
// All existing states (requesting_location onward) are completely unchanged.
type ScanStep = 'face_pending' | 'requesting_location' | 'scanning' | 'processing' | 'success' | 'invalid' | 'expired';

// ─── Scanner Frame ───────────────────────────
function ScanFrame({ active }: { active: boolean }) {
  return (
    <div className="relative w-64 h-64 mx-auto">
      {/* Corner brackets */}
      {['tl', 'tr', 'bl', 'br'].map((corner) => (
        <div
          key={corner}
          className={cn(
            'absolute w-10 h-10 border-primary-500',
            corner === 'tl' && 'top-0 left-0 border-t-[3px] border-l-[3px] rounded-tl-lg',
            corner === 'tr' && 'top-0 right-0 border-t-[3px] border-r-[3px] rounded-tr-lg',
            corner === 'bl' && 'bottom-0 left-0 border-b-[3px] border-l-[3px] rounded-bl-lg',
            corner === 'br' && 'bottom-0 right-0 border-b-[3px] border-r-[3px] rounded-br-lg',
          )}
        />
      ))}

      {/* Scanner grid overlay */}
      <div className="absolute inset-3 grid grid-cols-3 grid-rows-3 opacity-10">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="border border-white/30" />
        ))}
      </div>

      {/* Scan line */}
      {active && (
        <motion.div
          className="absolute left-3 right-3 h-0.5 bg-gradient-to-r from-transparent via-primary-500 to-transparent"
          animate={{ top: ['12px', 'calc(100% - 12px)', '12px'] }}
          transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity }}
        />
      )}

      {/* Center crosshair */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20">
        <div className="w-px h-8 bg-white absolute" />
        <div className="w-8 h-px bg-white absolute" />
      </div>
    </div>
  );
}

// ─── Success Overlay ─────────────────────────
function SuccessOverlay({ onDone, result }: { onDone: () => void, result: any }) {
  const timeFormatted = result?.time ? new Date(result.time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '';
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center z-10"
    >
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="text-center"
      >
        <div className="relative mb-6">
          <div className="w-28 h-28 rounded-full bg-success-500 flex items-center justify-center mx-auto">
            <CheckCircle2 size={56} className="text-white" />
          </div>
          <motion.div
            className="absolute inset-0 rounded-full bg-success-400 mx-auto"
            initial={{ scale: 1, opacity: 0.4 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Attendance Successful!</h2>
        <p className="text-neutral-600 text-body-md mb-2">{result?.type === 'keluar' ? 'Out' : 'In'} recorded at {timeFormatted}</p>
        <div className="inline-block bg-neutral-100 rounded-full px-4 py-1.5 text-neutral-700 font-medium text-body-sm">
          {result?.office_name || 'Office Building'}
        </div>
        <div className="mt-8 space-y-3 w-72 mx-auto">
          <Link href="/dashboard" className="btn btn-primary btn-full btn-lg flex items-center justify-center gap-2">
            Back to Dashboard
          </Link>
          <button onClick={onDone} className="btn btn-ghost btn-full flex items-center justify-center gap-2">
            Scan again
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Error Overlay ────────────────────────────
function ErrorOverlay({ type, message, onRetry }: { type: 'invalid' | 'expired'; message?: string; onRetry: () => void }) {
  const isLocationError = message?.toLowerCase().includes('luar area') || message?.toLowerCase().includes('lokasi');
  const title = isLocationError ? 'Outside Office Area' : (type === 'invalid' ? 'Invalid QR Code' : 'Expired QR Code');
  const Icon = isLocationError ? MapPin : (type === 'invalid' ? XCircle : Clock);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center z-10"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        className="text-center px-6"
      >
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-5 ${type === 'invalid' ? 'bg-danger-100' : 'bg-warning-100'}`}>
          <Icon size={44} className={type === 'invalid' ? 'text-danger-600' : 'text-warning-600'} />
        </div>
        <h2 className="text-xl font-bold text-neutral-900 mb-2">
          {title}
        </h2>
        <p className="text-neutral-600 text-body-md mb-6 max-w-sm mx-auto">
          {message || (type === 'invalid'
            ? 'QR code not recognized. Make sure you scan the correct QR.'
            : 'QR code has expired. Request a new QR code from admin/system.'
          )}
        </p>
        <div className="space-y-3 w-64 mx-auto">
          <button onClick={onRetry} className="btn btn-primary btn-full btn-lg flex items-center justify-center gap-2">
            <RotateCcw size={16} /> Try Again
          </button>
          <Link href="/dashboard" className="btn btn-ghost btn-full flex items-center justify-center gap-2">
            Back to Dashboard
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ScanPage() {
  // Face gate is the initial state — GPS/QR flow only starts after face verification.
  const [scanStep, setScanStep] = useState<ScanStep>('face_pending');
  const [location, setLocation] = useState<{ lat: number; lng: number; acc: number } | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [scanResult, setScanResult] = useState<any>(null);
  
  const profile = useAuthStore(state => state.profile);
  const isLoading = useAuthStore(state => state.isLoading);

  // Face descriptor from Supabase profiles (null = not enrolled)
  const faceDescriptor: number[] | null = profile?.face_descriptor ?? null;
  
  // Guard ref to prevent multiple concurrent requests
  const isProcessingScan = useRef(false);

  // Called by FaceVerificationStep on success — transition to GPS flow
  const handleFaceVerified = () => {
    setScanStep('requesting_location');
  };

  // 1. Request location on mount
  useEffect(() => {
    if (scanStep !== 'requesting_location') return;

    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      setScanStep('invalid');
      return;
    }

    getHighAccuracyLocation({ timeoutMs: 12000, desiredAccuracy: 40 })
      .then((loc) => {
        setLocation(loc);
        
        // Location Pre-validation
        if (loc.acc > 100) {
           setErrorMsg('GPS accuracy is too low (±' + Math.round(loc.acc) + 'm). Ensure you are outdoors or have a good GPS signal for attendance.');
           setScanStep('invalid');
           return;
        }

        const office = Array.isArray(profile?.offices) ? profile?.offices[0] : profile?.offices;
        if (office && office.latitude && office.longitude && office.radius) {
           const dist = calculateDistance(loc.lat, loc.lng, office.latitude, office.longitude);
           if (dist > office.radius) {
              setErrorMsg(`You are outside the office area. Distance: ${Math.round(dist)} meters (Maximum: ${office.radius} meters)`);
              setScanStep('invalid');
              return;
           }
        }
        
        setScanStep('scanning'); // Location granted and valid, move to scanning
      })
      .catch((err) => {
        setErrorMsg(err.message || 'Location permission denied or failed. Please allow location access to submit attendance.');
        setScanStep('invalid');
      });
  }, [scanStep, profile]);

  // 2. Handle scan success
  const handleScanSuccess = async (token: string) => {
    // Check ref immediately synchronously to prevent duplicate calls
    if (scanStep !== 'scanning' || !location || isProcessingScan.current) return;
    
    isProcessingScan.current = true;
    setScanStep('processing');

    try {
      const res = await submitCheckIn({
        latitude: location.lat,
        longitude: location.lng,
        accuracy: location.acc,
        qrToken: token.trim() // Just in case there's whitespace
      });

      if (res.error) {
        setErrorMsg(res.error);
        setScanStep('invalid');
        isProcessingScan.current = false;
      } else {
        setScanResult(res);
        setScanStep('success');
        isProcessingScan.current = false;
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('Network or server error occurred');
      setScanStep('invalid');
      isProcessingScan.current = false;
    }
  };

  const handleRetry = () => {
    isProcessingScan.current = false;
    setScanResult(null);
    // Reset to face gate so the full security flow runs again
    setScanStep('face_pending');
    setErrorMsg('');
  };

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-neutral-50 pb-20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-primary-600" />
          <p className="text-neutral-500 font-medium text-sm">Loading profile data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col bg-neutral-50 safe-top">
      {/* ─── Header ─── */}
      <header className="relative z-20 flex items-center justify-between px-4 pt-4 pb-2 safe-top">
        <Link
          href="/dashboard"
          className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-neutral-600 hover:bg-neutral-100 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-neutral-900 font-semibold text-body-lg">Scan Attendance QR</h1>
        <div className="w-10 flex items-center justify-end">
          {torchSupported && (
            <button
              onClick={() => setTorchOn(!torchOn)}
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-colors',
                torchOn ? 'bg-warning-100 text-warning-600' : 'bg-white text-neutral-600 hover:bg-neutral-100'
              )}
              aria-label="Toggle flashlight"
            >
              <Lightbulb size={18} />
            </button>
          )}
        </div>
      </header>

      {/* ─── Scanner Area ─── */}
      <div className="flex-1 flex flex-col items-center justify-center relative px-4">
        {/* Scanner */}
        <div className="relative z-10 w-full max-w-sm mx-auto">

          {/* ── FACE GATE — new initial step, camera starts here ── */}
          {scanStep === 'face_pending' && (
            <FaceVerificationStep
              storedDescriptor={faceDescriptor}
              onVerified={handleFaceVerified}
            />
          )}

          {scanStep === 'requesting_location' && (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-neutral-300 rounded-2xl bg-white shadow-sm">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
              <p className="text-neutral-500 text-sm font-medium">Locking GPS signal...</p>
              <p className="text-neutral-400 text-xs mt-1">(May take a few seconds)</p>
            </div>
          )}

          {scanStep === 'scanning' && (
             <div className="relative rounded-2xl overflow-hidden shadow-xl ring-4 ring-white">
               <QRScannerComponent 
                 onScanSuccess={handleScanSuccess} 
                 torchOn={torchOn} 
                 onTorchSupportChange={setTorchSupported} 
               />
               <div className="absolute inset-0 pointer-events-none">
                 <ScanFrame active={true} />
               </div>
             </div>
          )}
          
          {scanStep === 'processing' && (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-primary-200 rounded-2xl bg-primary-50 shadow-sm">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
              <p className="text-primary-700 font-semibold">Verifying attendance...</p>
            </div>
          )}
        </div>

        {/* Result overlays */}
        <AnimatePresence>
          {scanStep === 'success' && <SuccessOverlay onDone={handleRetry} result={scanResult} />}
          {(scanStep === 'invalid' || scanStep === 'expired') && (
            <ErrorOverlay type={scanStep} message={errorMsg} onRetry={handleRetry} />
          )}
        </AnimatePresence>
      </div>

      {/* ─── Bottom Instruction Panel ─── */}
      {(scanStep === 'face_pending' || scanStep === 'requesting_location' || scanStep === 'scanning' || scanStep === 'processing') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-20 pb-10 px-6 safe-bottom mt-8"
        >
          <div className="bg-white shadow-md rounded-2xl p-5 text-center border border-neutral-100">
            <Info size={20} className="text-primary-500 mx-auto mb-3" />
            <h3 className="text-neutral-900 font-bold mb-1.5">
              {scanStep === 'face_pending' ? 'Face Verification Required' :
               scanStep === 'requesting_location' ? 'Location Permission Required' :
               scanStep === 'processing' ? 'Checking...' : 'Point camera at QR Code'}
            </h3>
            <p className="text-neutral-500 text-body-sm leading-relaxed">
              {scanStep === 'face_pending'
                ? 'Face verification is required before attendance. QR scanner will open after face is recognized.'
                : 'QR code is available at the reception or office entrance. Make sure you are inside the office radius.'}
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              {scanStep === 'scanning' && (
                <>
                  <span className="status-dot bg-emerald-500 animate-pulse w-2 h-2 rounded-full" />
                  <span className="text-emerald-700 font-medium text-[11px]">Face verified · Location verified · GPS active</span>
                </>
              )}
              {scanStep === 'face_pending' && (
                <>
                  <span className="w-2 h-2 rounded-full bg-warning-400 animate-pulse" />
                  <span className="text-warning-700 font-medium text-[11px]">QR scanner locked · Waiting for face verification</span>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
