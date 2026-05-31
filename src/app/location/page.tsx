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
  { key: 'requesting', label: 'Request Permission' },
  { key: 'loading', label: 'Loading' },
  { key: 'inside', label: 'Inside Radius' },
  { key: 'outside', label: 'Outside Radius' },
  { key: 'low_accuracy', label: 'Weak GPS' },
  { key: 'denied', label: 'Denied' },
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
      <h2 className="text-heading-xl text-neutral-900 mb-3">Allow Location Access</h2>
      <p className="text-body-md text-neutral-500 max-w-sm leading-relaxed mb-8">
        TelIntern needs location access to validate your presence at the office before submitting attendance.
      </p>
      <div className="card p-4 mb-6 w-full max-w-sm text-left">
        <p className="text-label-sm text-neutral-500 mb-1 uppercase tracking-wide">Office Location</p>
        <p className="text-body-md font-semibold text-neutral-900">{office?.nama || 'Office'}</p>
        <p className="text-body-sm text-neutral-500 mt-0.5">Branch Office</p>
        <p className="text-body-sm text-neutral-400 mt-1">Radius: {office?.radius || 150} meters</p>
      </div>
      <button onClick={onAllow} className="btn btn-primary btn-lg btn-full max-w-sm">
        <MapPin size={18} /> Allow Location Access
      </button>
      <p className="text-body-sm text-neutral-400 mt-3">Location data is only used during attendance</p>
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
      <h2 className="text-heading-xl text-neutral-900 mb-2">Detecting Location...</h2>
      <p className="text-body-md text-neutral-500">Please wait, GPS is active</p>
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
      <h2 className="text-heading-xl text-success-700 mb-2">You are inside the radius!</h2>
      <p className="text-body-md text-neutral-500 mb-6">
        Location detected {formatDistance(distance)} from office — within {office?.radius || 150}m radius
      </p>
      <div className="card p-4 w-full max-w-sm mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-success-50 flex items-center justify-center">
            <MapPin size={18} className="text-success-600" />
          </div>
          <div className="text-left">
            <p className="text-body-md font-semibold text-neutral-900">{office?.nama || 'Office'}</p>
            <p className="text-body-sm text-neutral-500">GPS active · High accuracy</p>
          </div>
        </div>
      </div>
      <Link href="/scan" className="btn btn-primary btn-lg btn-full max-w-sm">
        Continue to QR Scanner
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
      <h2 className="text-heading-xl text-warning-700 mb-2">Outside office area</h2>
      <p className="text-body-md text-neutral-500 mb-6">
        You are ±{formatDistance(distance)} from the office.<br />
        Must be within {office?.radius || 150}m radius to submit attendance.
      </p>
      <div className="card p-4 w-full max-w-sm mb-6 border-warning-200 bg-warning-50">
        <div className="flex items-start gap-3">
          <AlertTriangle size={18} className="text-warning-600 flex-shrink-0 mt-0.5" />
          <div className="text-left">
            <p className="text-body-sm font-semibold text-warning-800">Attendance cannot be submitted</p>
            <p className="text-body-sm text-warning-700 mt-0.5">Go to the office location first then try again.</p>
          </div>
        </div>
      </div>
      <button type="button" className="btn btn-outline btn-lg max-w-sm w-full" onClick={onRefresh}>
        <RefreshCw size={16} /> Update Location
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
      <h2 className="text-heading-xl text-neutral-900 mb-2">Low GPS Accuracy</h2>
      <p className="text-body-md text-neutral-500 mb-3">Current accuracy: ±85 meters — too low for validation</p>
      <div className="card p-4 w-full max-w-sm mb-6 bg-orange-50 border-orange-200">
        <p className="text-body-sm text-orange-800 font-medium mb-2">Tips to improve GPS accuracy:</p>
        <ul className="text-body-sm text-orange-700 space-y-1 text-left list-disc list-inside">
          <li>Move to an open area</li>
          <li>Enable High Accuracy Mode</li>
          <li>Wait a few seconds</li>
          <li>Restart GPS in settings</li>
        </ul>
      </div>
      <button type="button" onClick={onRetry} className="btn btn-primary btn-lg max-w-sm w-full">
        <RefreshCw size={16} /> Try Again
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
      <h2 className="text-heading-xl text-neutral-900 mb-2">Location Permission Denied</h2>
      <p className="text-body-md text-neutral-500 mb-6 max-w-sm">Attendance cannot be submitted because location access is denied. Enable it from browser/device settings.</p>
      <div className="card p-4 w-full max-w-sm mb-6">
        <p className="text-body-sm font-medium text-neutral-700 mb-2">How to enable:</p>
        <ol className="text-body-sm text-neutral-600 space-y-1 text-left list-decimal list-inside">
          <li>Open device <strong>Settings</strong></li>
          <li>Select <strong>Privacy → Location</strong></li>
          <li>Enable for your browser</li>
          <li>Reload this page</li>
        </ol>
      </div>
      <button className="btn btn-outline btn-lg max-w-sm w-full">
        <Settings size={16} /> Open Settings
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
        <h1 className="text-heading-md font-semibold text-neutral-900">Location Validation</h1>
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
