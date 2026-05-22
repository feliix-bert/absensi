'use client';

import { MapPin, QrCode, CheckCircle2, Clock } from 'lucide-react';

export function HeroPreview() {
  return (
    <div className="w-full max-w-[340px] lg:max-w-[360px] mx-auto lg:mx-0 lg:ml-auto">
      <div className="relative">
        <div className="absolute -inset-4 rounded-[2.25rem] bg-primary-600/15 blur-2xl pointer-events-none" aria-hidden />

        <div className="relative rounded-[1.75rem] border border-white/20 bg-white shadow-[0_24px_48px_rgba(6,24,40,0.35)] overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-4 pb-2 bg-neutral-50/90 border-b border-neutral-100">
            <span className="text-[11px] font-semibold text-neutral-800">TelIntern</span>
            <span className="text-[10px] text-neutral-400 tabular-nums">09:41</span>
          </div>

          <div className="p-5 space-y-3.5 bg-gradient-to-b from-neutral-50/80 to-white">
            <div className="rounded-xl bg-secondary-800 p-4 text-white">
              <p className="text-[11px] text-white/60">Selamat pagi</p>
              <p className="text-lg font-bold mt-0.5 pr-2">Yohana</p>
              <p className="text-[11px] text-white/50 mt-1">Kamis, 21 Mei 2025</p>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-100/80">
              <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0">
                <MapPin size={16} className="text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-emerald-800">Di dalam radius</p>
                <p className="text-[10px] text-emerald-600">± 45 m · GPS aktif</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-xl bg-white border border-neutral-100">
                <Clock size={14} className="text-neutral-400 mb-1" />
                <p className="text-[10px] text-neutral-500">Masuk</p>
                <p className="text-base font-bold text-neutral-900 tabular-nums">07:58</p>
              </div>
              <div className="p-3 rounded-xl bg-white border border-neutral-100">
                <CheckCircle2 size={14} className="text-emerald-500 mb-1" />
                <p className="text-[10px] text-neutral-500">Status</p>
                <p className="text-base font-bold text-emerald-600">Hadir</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-primary-600 text-white">
              <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                <QrCode size={20} />
              </div>
              <div>
                <p className="text-sm font-bold">Absen Sekarang</p>
                <p className="text-[10px] text-white/75">Scan QR di kantor</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats below phone — no overlap */}
      <div className="mt-5 flex flex-wrap justify-center lg:justify-start gap-3">
        <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/95 border border-neutral-200/80 shadow-md text-xs font-semibold text-neutral-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          94% Kehadiran
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/95 border border-neutral-200/80 shadow-md text-xs font-semibold text-neutral-800">
          <QrCode size={14} className="text-primary-600" />
          Validasi QR
        </div>
      </div>
    </div>
  );
}
