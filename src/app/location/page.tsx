'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, CheckCircle2, AlertTriangle, WifiOff,
  RefreshCw, Settings, ArrowLeft, Navigation
} from 'lucide-react';
import Link from 'next/link';
import { cn, formatDistance } from '@/lib/utils';
import { useAuthStore } from '@/features/auth/store/authStore';
import type { LocationStatus } from '@/lib/types';
import { useLocation } from '@/hooks/useLocation';

type DemoState = LocationStatus;

const DEMO_STATES: { key: DemoState; label: string }[] = [
  { key: 'requesting', label: 'Minta Izin' },
  { key: 'loading', label: 'Loading' },
  { key: 'inside', label: 'Dalam Radius' },
  { key: 'outside', label: 'Di Luar Radius' },
  { key: 'low_accuracy', label: 'GPS Lemah' },
  { key: 'denied', label: 'Ditolak' },
];

function RequestingState({ onAllow, office }: { onAllow: () => void, office: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center text-center py-10"
    >
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full bg-primary-50 flex items-center justify-center">
          <MapPin size={40} className="text-primary-600" />
        </div>
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-primary-300"
          animate={{ scale: [1, 1.4, 1], opacity: [1, 0, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
      <h2 className="text-heading-xl text-neutral-900 mb-3">Izinkan Akses Lokasi</h2>
      <p className="text-body-md text-neutral-500 max-w-sm leading-relaxed mb-8">
        TelIntern memerlukan akses lokasi untuk memvalidasi keberadaanmu di area kantor sebelum melakukan absensi.
      </p>
      <div className="card p-4 mb-6 w-full max-w-sm text-left">
        <p className="text-label-sm text-neutral-500 mb-1 uppercase tracking-wide">Lokasi Kantor</p>
        <p className="text-body-md font-semibold text-neutral-900">{office?.nama || 'Kantor'}</p>
        <p className="text-body-sm text-neutral-500 mt-0.5">Kantor Cabang</p>
        <p className="text-body-sm text-neutral-400 mt-1">Radius: {office?.radius || 150} meter</p>
      </div>
      <button onClick={onAllow} className="btn btn-primary btn-lg btn-full max-w-sm">
        <MapPin size={18} /> Izinkan Akses Lokasi
      </button>
      <p className="text-body-sm text-neutral-400 mt-3">Data lokasi hanya digunakan saat absensi</p>
    </motion.div>
  );
}

function LoadingState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center text-center py-16"
    >
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-full bg-secondary-50 flex items-center justify-center">
          <Navigation size={32} className="text-secondary-600" />
        </div>
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border border-secondary-300"
            animate={{ scale: [1, 1.5 + i * 0.3], opacity: [0.7, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4 }}
          />
        ))}
      </div>
      <h2 className="text-heading-xl text-neutral-900 mb-2">Mendeteksi Lokasi...</h2>
      <p className="text-body-md text-neutral-500">Mohon tunggu, GPS sedang aktif</p>
      <div className="flex items-center gap-1.5 mt-4">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-secondary-400"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
      </div>
    </motion.div>
  );
}

function InsideState({ distance, office }: { distance: number, office: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center text-center py-10"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        className="relative mb-8"
      >
        <div className="w-28 h-28 rounded-full bg-success-50 flex items-center justify-center">
          <CheckCircle2 size={52} className="text-success-500" />
        </div>
        <div className="absolute inset-0 rounded-full bg-success-100 animate-ping opacity-30" />
      </motion.div>
      <h2 className="text-heading-xl text-success-700 mb-2">Anda di dalam radius!</h2>
      <p className="text-body-md text-neutral-500 mb-6">
        Lokasi terdeteksi {formatDistance(distance)} dari kantor — dalam radius {office?.radius || 150}m
      </p>
      <div className="card p-4 w-full max-w-sm mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-success-50 flex items-center justify-center">
            <MapPin size={18} className="text-success-600" />
          </div>
          <div className="text-left">
            <p className="text-body-md font-semibold text-neutral-900">{office?.nama || 'Kantor'}</p>
            <p className="text-body-sm text-neutral-500">GPS aktif · Akurasi tinggi</p>
          </div>
        </div>
      </div>
      <Link href="/scan" className="btn btn-primary btn-lg btn-full max-w-sm">
        Lanjut ke QR Scanner
      </Link>
    </motion.div>
  );
}

function OutsideState({ distance, onRefresh, office }: { distance: number; onRefresh: () => void, office: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center text-center py-10"
    >
      <div className="w-24 h-24 rounded-full bg-warning-50 flex items-center justify-center mb-6">
        <AlertTriangle size={40} className="text-warning-500" />
      </div>
      <h2 className="text-heading-xl text-warning-700 mb-2">Di luar area kantor</h2>
      <p className="text-body-md text-neutral-500 mb-6">
        Kamu berada ±{formatDistance(distance)} dari kantor.<br />
        Perlu dalam radius {office?.radius || 150}m untuk absen.
      </p>
      <div className="card p-4 w-full max-w-sm mb-6 border-warning-200 bg-warning-50">
        <div className="flex items-start gap-3">
          <AlertTriangle size={18} className="text-warning-600 flex-shrink-0 mt-0.5" />
          <div className="text-left">
            <p className="text-body-sm font-semibold text-warning-800">Absensi tidak dapat dilakukan</p>
            <p className="text-body-sm text-warning-700 mt-0.5">Datangi lokasi kantor terlebih dahulu lalu coba lagi.</p>
          </div>
        </div>
      </div>
      <button type="button" className="btn btn-outline btn-lg max-w-sm w-full" onClick={onRefresh}>
        <RefreshCw size={16} /> Perbarui Lokasi
      </button>
    </motion.div>
  );
}

function LowAccuracyState({ onRetry }: { onRetry: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center text-center py-10"
    >
      <div className="w-24 h-24 rounded-full bg-orange-50 flex items-center justify-center mb-6">
        <WifiOff size={40} className="text-orange-500" />
      </div>
      <h2 className="text-heading-xl text-neutral-900 mb-2">Akurasi GPS Rendah</h2>
      <p className="text-body-md text-neutral-500 mb-3">Akurasi saat ini: ±85 meter — terlalu rendah untuk validasi</p>
      <div className="card p-4 w-full max-w-sm mb-6 bg-orange-50 border-orange-200">
        <p className="text-body-sm text-orange-800 font-medium mb-2">Tips meningkatkan akurasi GPS:</p>
        <ul className="text-body-sm text-orange-700 space-y-1 text-left list-disc list-inside">
          <li>Pindah ke area terbuka</li>
          <li>Aktifkan Mode Akurasi Tinggi</li>
          <li>Tunggu beberapa detik</li>
          <li>Restart GPS di pengaturan</li>
        </ul>
      </div>
      <button type="button" onClick={onRetry} className="btn btn-primary btn-lg max-w-sm w-full">
        <RefreshCw size={16} /> Coba Lagi
      </button>
    </motion.div>
  );
}

function DeniedState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center text-center py-10"
    >
      <div className="w-24 h-24 rounded-full bg-danger-50 flex items-center justify-center mb-6">
        <MapPin size={40} className="text-danger-500 line-through" />
      </div>
      <h2 className="text-heading-xl text-neutral-900 mb-2">Izin Lokasi Ditolak</h2>
      <p className="text-body-md text-neutral-500 mb-6 max-w-sm">Absensi tidak bisa dilakukan karena akses lokasi ditolak. Aktifkan dari pengaturan browser/perangkat.</p>
      <div className="card p-4 w-full max-w-sm mb-6">
        <p className="text-body-sm font-medium text-neutral-700 mb-2">Cara mengaktifkan:</p>
        <ol className="text-body-sm text-neutral-600 space-y-1 text-left list-decimal list-inside">
          <li>Buka <strong>Pengaturan</strong> perangkat</li>
          <li>Pilih <strong>Privasi → Lokasi</strong></li>
          <li>Aktifkan untuk browser kamu</li>
          <li>Muat ulang halaman ini</li>
        </ol>
      </div>
      <button className="btn btn-outline btn-lg max-w-sm w-full">
        <Settings size={16} /> Buka Pengaturan
      </button>
    </motion.div>
  );
}

export default function LocationPage() {
  const { data, requestPermission, setDemoState, refresh } = useLocation();
  const state = (data.status === 'idle' ? 'requesting' : data.status) as DemoState;
  const profile = useAuthStore(state => state.profile);
  const office = Array.isArray(profile?.offices) ? profile?.offices[0] : profile?.offices;

  const handleAllow = () => {
    void requestPermission();
  };

  return (
    <div className="min-h-dvh bg-neutral-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-neutral-100 h-14 flex items-center px-4 gap-3">
        <Link href="/dashboard" className="w-9 h-9 rounded-lg flex items-center justify-center text-neutral-500 hover:bg-neutral-100 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-heading-md font-semibold text-neutral-900">Validasi Lokasi</h1>
      </header>

      {/* Demo state switcher */}
      <div className="bg-secondary-700 px-4 py-3">
        <p className="text-white text-[11px] font-medium mb-2 uppercase tracking-wide">Demo State</p>
        <div className="flex flex-wrap gap-2">
          {DEMO_STATES.map((s) => (
            <button
              key={s.key}
              onClick={() => setDemoState(s.key)}
              className={cn(
                'px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors',
                state === s.key ? 'bg-primary-600 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-5 py-6">
        <AnimatePresence mode="wait">
          <motion.div key={state}>
            {state === 'requesting' && <RequestingState onAllow={handleAllow} office={office} />}
            {state === 'loading' && <LoadingState />}
            {state === 'inside' && <InsideState distance={data.distance ?? 45} office={office} />}
            {state === 'outside' && (
              <OutsideState distance={data.distance ?? 430} onRefresh={() => void refresh()} office={office} />
            )}
            {state === 'low_accuracy' && <LowAccuracyState onRetry={() => void refresh()} />}
            {state === 'denied' && <DeniedState />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
