'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, CheckCircle2, XCircle, Clock,
  RotateCcw, Lightbulb, Info
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { ScanResult } from '@/lib/types';

type DemoScan = ScanResult;

const DEMO_STATES: { key: DemoScan; label: string }[] = [
  { key: 'scanning', label: 'Scanning' },
  { key: 'success', label: 'Sukses' },
  { key: 'invalid', label: 'Tidak Valid' },
  { key: 'expired', label: 'Kadaluarsa' },
];

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
function SuccessOverlay({ onDone }: { onDone: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10"
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
        <h2 className="text-2xl font-bold text-white mb-2">Absensi Berhasil!</h2>
        <p className="text-neutral-300 text-body-md mb-2">Masuk dicatat pada pukul 07:58</p>
        <div className="inline-block bg-white/10 rounded-full px-4 py-1.5 text-white text-body-sm">
          Gedung Graha Merah Putih
        </div>
        <div className="mt-8 space-y-3 w-72">
          <Link href="/dashboard" className="btn btn-primary btn-full btn-lg">
            Kembali ke Dashboard
          </Link>
          <button onClick={onDone} className="btn btn-ghost btn-full text-white hover:bg-white/10">
            Scan lagi
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Error Overlay ────────────────────────────
function ErrorOverlay({ type, onRetry }: { type: 'invalid' | 'expired'; onRetry: () => void }) {
  const isInvalid = type === 'invalid';
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        className="text-center px-6"
      >
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-5 ${isInvalid ? 'bg-danger-500' : 'bg-warning-500'}`}>
          {isInvalid
            ? <XCircle size={44} className="text-white" />
            : <Clock size={44} className="text-white" />
          }
        </div>
        <h2 className="text-xl font-bold text-white mb-2">
          {isInvalid ? 'QR Code Tidak Valid' : 'QR Code Kadaluarsa'}
        </h2>
        <p className="text-neutral-300 text-body-md mb-6">
          {isInvalid
            ? 'QR code tidak dikenali. Pastikan kamu scan QR yang benar.'
            : 'QR code sudah habis masa berlakunya. Minta QR code baru dari admin/sistem.'
          }
        </p>
        <div className="space-y-3 w-64">
          <button onClick={onRetry} className="btn btn-primary btn-full btn-lg">
            <RotateCcw size={16} /> Coba Lagi
          </button>
          <Link href="/dashboard" className="btn btn-ghost btn-full text-white hover:bg-white/10">
            Kembali ke Dashboard
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ScanPage() {
  const [scanState, setScanState] = useState<DemoScan>('scanning');
  const [torchOn, setTorchOn] = useState(false);

  const handleDemoChange = (state: DemoScan) => {
    setScanState(state);
  };

  const isResult = scanState !== 'scanning';

  return (
    <div className="min-h-dvh bg-neutral-900 flex flex-col">
      {/* ─── Header ─── */}
      <header className="relative z-20 flex items-center justify-between px-4 pt-4 pb-2 safe-top">
        <Link
          href="/dashboard"
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-white font-semibold text-body-lg">Scan QR Absensi</h1>
        <button
          onClick={() => setTorchOn(!torchOn)}
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
            torchOn ? 'bg-warning-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'
          )}
          aria-label="Toggle flashlight"
        >
          <Lightbulb size={18} />
        </button>
      </header>

      {/* ─── Demo switcher ─── */}
      <div className="relative z-20 px-4 py-2">
        <div className="flex gap-2 justify-center flex-wrap">
          {DEMO_STATES.map((s) => (
            <button
              key={s.key}
              onClick={() => handleDemoChange(s.key)}
              className={cn(
                'px-3 py-1 rounded-full text-[11px] font-medium transition-colors',
                scanState === s.key ? 'bg-primary-600 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Scanner Area ─── */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        {/* Dimmed corners overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="w-full h-full"
            style={{
              background: `radial-gradient(ellipse 280px 280px at 50% 45%, transparent 50%, rgba(0,0,0,0.7) 70%)`,
            }}
          />
        </div>

        {/* Scanner */}
        <div className="relative z-10">
          <ScanFrame active={scanState === 'scanning'} />
        </div>

        {/* Result overlays */}
        <AnimatePresence>
          {scanState === 'success' && <SuccessOverlay onDone={() => setScanState('scanning')} />}
          {(scanState === 'invalid' || scanState === 'expired') && (
            <ErrorOverlay type={scanState} onRetry={() => setScanState('scanning')} />
          )}
        </AnimatePresence>
      </div>

      {/* ─── Bottom Instruction Panel ─── */}
      {scanState === 'scanning' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-20 pb-10 px-6 safe-bottom"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 text-center border border-white/10">
            <Info size={16} className="text-white/60 mx-auto mb-2" />
            <h3 className="text-white font-semibold mb-1">Arahkan kamera ke QR Code</h3>
            <p className="text-white/60 text-body-sm">
              QR code tersedia di area resepsionis atau pintu masuk kantor. Pastikan kamu sudah berada di dalam radius kantor.
            </p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <span className="status-dot bg-success-500 animate-pulse" />
              <span className="text-white/70 text-[11px]">Lokasi terverifikasi · GPS aktif</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
