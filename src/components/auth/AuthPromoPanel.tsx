'use client';

import { MapPin, QrCode, BarChart3, Shield } from 'lucide-react';

const HIGHLIGHTS = [
  { icon: MapPin, label: 'Office GPS radius', value: 'Auto-validation' },
  { icon: QrCode, label: 'QR Scan', value: '< 3 seconds' },
  { icon: BarChart3, label: 'Attendance recap', value: 'Real-time' },
];

export function AuthPromoPanel({ variant = 'signup' }: { variant?: 'signup' | 'login' }) {
  return (
    <div className="hidden lg:flex flex-col justify-between rounded-3xl overflow-hidden min-h-[540px] relative bg-[#F8FAFC] border border-neutral-200/80 shadow-[0_20px_50px_rgba(14,42,71,0.08)]">
      {/* Top brand strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-primary-600 via-primary-500 to-primary-600" />

      <div className="flex-1 p-9 flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-2xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-600/25">
            <span className="text-white font-bold">TI</span>
          </div>
          <div>
            <p className="font-bold text-neutral-900">TelIntern</p>
            <p className="text-xs text-neutral-500">Telkom Indonesia</p>
          </div>
        </div>

        <h2 className="text-[1.65rem] font-bold text-secondary-800 leading-snug mb-3">
          {variant === 'signup'
            ? 'Manage your internship attendance neatly'
            : 'Welcome back'}
        </h2>
        <p className="text-neutral-600 text-sm leading-relaxed mb-8 max-w-sm">
          {variant === 'signup'
            ? 'Location and QR-based attendance platform for Telkom interns — transparent and easy to monitor.'
            : 'Continue your daily attendance. Check location, scan QR, and monitor history.'}
        </p>

        {/* Mini metric cards — reference-style stacked cards */}
        <div className="space-y-3 mt-auto">
          {HIGHLIGHTS.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-neutral-100 shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                <item.icon size={18} className="text-primary-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-neutral-500">{item.label}</p>
                <p className="text-sm font-semibold text-neutral-900">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom trust bar */}
      <div className="px-9 py-4 bg-secondary-800 flex items-center gap-2">
        <Shield size={16} className="text-primary-400 shrink-0" />
        <p className="text-xs text-white/80">
          Attendance data is encrypted · Compliant with Telkom internship policies
        </p>
      </div>
    </div>
  );
}
