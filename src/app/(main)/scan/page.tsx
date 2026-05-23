'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, CheckCircle2, XCircle, Clock,
  RotateCcw, Lightbulb, Info, MapPin
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { QRScannerComponent } from '@/components/shared/QRScannerComponent';
import { submitCheckIn } from '@/actions/attendance.actions';
import { useAuthStore } from '@/features/auth/store/authStore';
import { calculateDistance } from '@/features/attendance/utils/geo.utils';

type ScanStep = 'requesting_location' | 'scanning' | 'processing' | 'success' | 'invalid' | 'expired';

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
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Absensi Berhasil!</h2>
        <p className="text-neutral-600 text-body-md mb-2">{result?.type === 'keluar' ? 'Keluar' : 'Masuk'} dicatat pada pukul {timeFormatted}</p>
        <div className="inline-block bg-neutral-100 rounded-full px-4 py-1.5 text-neutral-700 font-medium text-body-sm">
          {result?.office_name || 'Gedung Kantor'}
        </div>
        <div className="mt-8 space-y-3 w-72 mx-auto">
          <Link href="/dashboard" className="btn btn-primary btn-full btn-lg flex items-center justify-center gap-2">
            Kembali ke Dashboard
          </Link>
          <button onClick={onDone} className="btn btn-ghost btn-full flex items-center justify-center gap-2">
            Scan lagi
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Error Overlay ────────────────────────────
function ErrorOverlay({ type, message, onRetry }: { type: 'invalid' | 'expired'; message?: string; onRetry: () => void }) {
  const isLocationError = message?.toLowerCase().includes('luar area') || message?.toLowerCase().includes('lokasi');
  const title = isLocationError ? 'Di Luar Area Kantor' : (type === 'invalid' ? 'QR Code Tidak Valid' : 'QR Code Kadaluarsa');
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
            ? 'QR code tidak dikenali. Pastikan kamu scan QR yang benar.'
            : 'QR code sudah habis masa berlakunya. Minta QR code baru dari admin/sistem.'
          )}
        </p>
        <div className="space-y-3 w-64 mx-auto">
          <button onClick={onRetry} className="btn btn-primary btn-full btn-lg flex items-center justify-center gap-2">
            <RotateCcw size={16} /> Coba Lagi
          </button>
          <Link href="/dashboard" className="btn btn-ghost btn-full flex items-center justify-center gap-2">
            Kembali ke Dashboard
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ScanPage() {
  const [scanStep, setScanStep] = useState<ScanStep>('requesting_location');
  const [location, setLocation] = useState<{ lat: number; lng: number; acc: number } | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [scanResult, setScanResult] = useState<any>(null);
  
  const profile = useAuthStore(state => state.profile);
  
  // Guard ref to prevent multiple concurrent requests
  const isProcessingScan = useRef(false);

  // 1. Request location on mount
  useEffect(() => {
    if (scanStep !== 'requesting_location') return;

    if (!navigator.geolocation) {
      setErrorMsg('Geolocation tidak didukung oleh browser Anda.');
      setScanStep('invalid');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const acc = position.coords.accuracy;
        setLocation({ lat, lng, acc });
        
        // Location Pre-validation
        const office = Array.isArray(profile?.offices) ? profile?.offices[0] : profile?.offices;
        if (office && office.latitude && office.longitude && office.radius) {
           const dist = calculateDistance(lat, lng, office.latitude, office.longitude);
           if (dist > office.radius) {
              setErrorMsg(`Anda berada di luar area kantor. Jarak Anda: ${Math.round(dist)} meter (Maksimal: ${office.radius} meter)`);
              setScanStep('invalid');
              return;
           }
        }
        
        setScanStep('scanning'); // Location granted and valid, move to scanning
      },
      (err) => {
        setErrorMsg('Izin lokasi ditolak atau gagal. Tolong izinkan akses lokasi untuk bisa absen.');
        setScanStep('invalid');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
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
      setErrorMsg('Terjadi kesalahan jaringan atau server');
      setScanStep('invalid');
      isProcessingScan.current = false;
    }
  };

  const handleRetry = () => {
    isProcessingScan.current = false;
    setScanResult(null);
    setScanStep('requesting_location');
    setErrorMsg('');
  };


  return (
    <div className="min-h-dvh bg-neutral-50 flex flex-col">
      {/* ─── Header ─── */}
      <header className="relative z-20 flex items-center justify-between px-4 pt-4 pb-2 safe-top">
        <Link
          href="/dashboard"
          className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-neutral-600 hover:bg-neutral-100 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-neutral-900 font-semibold text-body-lg">Scan QR Absensi</h1>
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
      </header>

      {/* ─── Scanner Area ─── */}
      <div className="flex-1 flex flex-col items-center justify-center relative px-4">
        {/* Scanner */}
        <div className="relative z-10 w-full max-w-sm mx-auto">
          {scanStep === 'requesting_location' && (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-neutral-300 rounded-2xl bg-white shadow-sm">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
              <p className="text-neutral-500 text-sm font-medium">Memverifikasi lokasi Anda...</p>
            </div>
          )}

          {scanStep === 'scanning' && (
             <div className="relative rounded-2xl overflow-hidden shadow-xl ring-4 ring-white">
               <QRScannerComponent onScanSuccess={handleScanSuccess} torchOn={torchOn} />
               <div className="absolute inset-0 pointer-events-none">
                 <ScanFrame active={true} />
               </div>
             </div>
          )}
          
          {scanStep === 'processing' && (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-primary-200 rounded-2xl bg-primary-50 shadow-sm">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
              <p className="text-primary-700 font-semibold">Memverifikasi absen...</p>
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
      {(scanStep === 'requesting_location' || scanStep === 'scanning' || scanStep === 'processing') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-20 pb-10 px-6 safe-bottom mt-8"
        >
          <div className="bg-white shadow-md rounded-2xl p-5 text-center border border-neutral-100">
            <Info size={20} className="text-primary-500 mx-auto mb-3" />
            <h3 className="text-neutral-900 font-bold mb-1.5">
              {scanStep === 'requesting_location' ? 'Izin Lokasi Diperlukan' :
               scanStep === 'processing' ? 'Mengecek...' : 'Arahkan kamera ke QR Code'}
            </h3>
            <p className="text-neutral-500 text-body-sm leading-relaxed">
              QR code tersedia di area resepsionis atau pintu masuk kantor. Pastikan kamu sudah berada di dalam radius kantor.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              {scanStep === 'scanning' && (
                <>
                  <span className="status-dot bg-emerald-500 animate-pulse w-2 h-2 rounded-full" />
                  <span className="text-emerald-700 font-medium text-[11px]">Lokasi terverifikasi · GPS aktif</span>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
