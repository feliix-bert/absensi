'use client';

import {
  MapPin,
  QrCode,
  CheckCircle2,
  Clock,
  ChevronRight,
} from 'lucide-react';

/* ─── Micro stat row ─── */
function StatRow({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-neutral-500">{label}</span>
      <span
        className={`text-[12px] font-semibold tabular-nums ${
          accent ? 'text-success-600' : 'text-neutral-800'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export function HeroPreview() {
  return (
    /*
      Shell — gives the card a consistent max-width so it
      renders well both in the desktop parallax layer and
      as the mobile fallback.
    */
    <div className="w-full max-w-[340px] mx-auto">
      {/*
        Card: deliberate structure, editorial proportions.
        No overflow blur behind it — let it breathe.
      */}
      <div className="rounded-[1.5rem] border border-white/12 bg-white shadow-[0_32px_64px_rgba(6,24,40,0.40)] overflow-hidden">

        {/* ── Status bar ── */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-primary-600 flex items-center justify-center">
              <span className="text-white font-bold text-[9px] tracking-tight">TI</span>
            </div>
            <span className="text-[12px] font-semibold text-neutral-800">TelIntern</span>
          </div>
          <span className="text-[11px] text-neutral-400 tabular-nums font-medium">09 : 41</span>
        </div>

        {/* ── Greeting band ── */}
        <div className="px-5 pt-4 pb-3 bg-secondary-900">
          <p className="text-[10px] font-medium text-white/45 uppercase tracking-wider mb-0.5">
            Selamat pagi
          </p>
          <p className="text-[18px] font-bold text-white leading-tight">Yohana</p>
          <p className="text-[10px] text-white/35 mt-1">Kamis, 21 Mei 2025</p>
        </div>

        {/* ── Location status ── */}
        <div className="mx-4 mt-4 flex items-center gap-3 px-3.5 py-3 rounded-xl bg-success-50 border border-success-100">
          <div className="w-8 h-8 rounded-lg bg-success-500 flex items-center justify-center shrink-0">
            <MapPin size={14} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-success-800 leading-tight">Di dalam radius</p>
            <p className="text-[10px] text-success-600 mt-0.5">± 45 m · GPS aktif</p>
          </div>
        </div>

        {/* ── Quick stats grid ── */}
        <div className="grid grid-cols-2 gap-2.5 mx-4 mt-3">
          <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
            <div className="flex items-center gap-1.5 mb-2">
              <Clock size={11} className="text-neutral-400" />
              <span className="text-[10px] text-neutral-500">Masuk</span>
            </div>
            <p className="text-[17px] font-bold text-neutral-900 tabular-nums leading-none">07:58</p>
          </div>
          <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
            <div className="flex items-center gap-1.5 mb-2">
              <CheckCircle2 size={11} className="text-success-500" />
              <span className="text-[10px] text-neutral-500">Status</span>
            </div>
            <p className="text-[17px] font-bold text-success-600 leading-none">Hadir</p>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="mx-4 mt-3.5 h-px bg-neutral-100" />

        {/* ── Progress strip ── */}
        <div className="mx-4 mt-3.5 space-y-2">
          <StatRow label="Hari ini" value="7 j 42 m" />
          <StatRow label="Minggu ini" value="94%" accent />
          <StatRow label="Bulan ini" value="21 / 22 hari" />
        </div>

        {/* ── Primary CTA ── */}
        <div className="m-4 mt-4">
          <button
            type="button"
            className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl bg-primary-600 text-white hover:bg-primary-500 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                <QrCode size={16} className="text-white" />
              </div>
              <div className="text-left">
                <p className="text-[12px] font-bold leading-tight">Absen Sekarang</p>
                <p className="text-[10px] text-white/60 mt-0.5">Scan QR di kantor</p>
              </div>
            </div>
            <ChevronRight
              size={16}
              className="text-white/50 group-hover:translate-x-0.5 transition-transform"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
