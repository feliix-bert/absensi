'use client';

import { motion } from 'framer-motion';
import { MapPin, QrCode, ClipboardList, BarChart3 } from 'lucide-react';

/* ── Each feature gets its own color identity ── */
const FEATURES = [
  {
    num: '01',
    icon: MapPin,
    title: 'Location Validation',
    desc: 'System verifies GPS position before check-in. Only valid within configured office radius.',
    // Brand red tint
    iconBg: 'bg-primary-600',
    iconRing: 'ring-primary-100',
    accentBg: 'bg-primary-50',
    accentBorder: 'border-primary-100',
    numColor: 'text-primary-100',
    topBar: 'bg-primary-500',
    badge: { label: 'GPS', color: 'bg-primary-100 text-primary-700' },
  },
  {
    num: '02',
    icon: QrCode,
    title: 'QR Code Check-in',
    desc: 'Scan QR Code at the office area to record attendance instantly — takes less than 3 seconds.',
    // Brand deep blue tint
    iconBg: 'bg-secondary-700',
    iconRing: 'ring-secondary-100',
    accentBg: 'bg-secondary-50',
    accentBorder: 'border-secondary-100',
    numColor: 'text-secondary-200',
    topBar: 'bg-secondary-500',
    badge: { label: '< 3 seconds', color: 'bg-secondary-100 text-secondary-700' },
  },
  {
    num: '03',
    icon: ClipboardList,
    title: 'Attendance History',
    desc: 'Check-in time, check-out time, and work duration recorded daily, complete with period filters.',
    // Success / green tint
    iconBg: 'bg-success-600',
    iconRing: 'ring-success-100',
    accentBg: 'bg-success-50',
    accentBorder: 'border-success-100',
    numColor: 'text-success-200',
    topBar: 'bg-success-500',
    badge: { label: 'Automatic', color: 'bg-success-100 text-success-700' },
  },
  {
    num: '04',
    icon: BarChart3,
    title: 'Recap Dashboard',
    desc: 'Weekly and monthly attendance statistics with attendance percentage for interns and mentors.',
    // Warning / amber tint
    iconBg: 'bg-warning-500',
    iconRing: 'ring-warning-100',
    accentBg: 'bg-warning-50',
    accentBorder: 'border-warning-100',
    numColor: 'text-warning-200',
    topBar: 'bg-warning-500',
    badge: { label: 'Real-time', color: 'bg-warning-100 text-warning-700' },
  },
];

const STATS = [
  { value: '94%', label: 'Average attendance rate' },
  { value: '< 3s', label: 'QR check-in process' },
  { value: '2 step', label: 'First time setup' },
  { value: '100%', label: 'Verified GPS based' },
];

export function LandingFeatures() {
  return (
    <section id="fitur" className="scroll-mt-20 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #F7F9FC 60%, #EEF2F7 100%)' }}>

      {/* Soft structural dot grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #0E2A47 1px, transparent 0)`,
          backgroundSize: '36px 36px',
        }}
        aria-hidden
      />

      {/* Top-right red radial wash */}
      <div
        className="absolute -top-[30%] -right-[15%] w-[70%] h-[70%] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(204,0,0,0.04) 0%, transparent 65%)' }}
        aria-hidden
      />
      {/* Bottom-left blue radial wash */}
      <div
        className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(14,42,71,0.05) 0%, transparent 65%)' }}
        aria-hidden
      />

      {/* ── STAT STRIP ── */}
      <div className="border-b border-neutral-200/70 bg-white/60 backdrop-blur-sm">
        <div className="page-container">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-neutral-200/70">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="flex flex-col items-center justify-center py-5 px-4 gap-0.5"
              >
                <span className="text-[1.375rem] font-bold text-neutral-900 tabular-nums tracking-tight">{s.value}</span>
                <span className="text-[0.75rem] text-neutral-500 text-center leading-tight">{s.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="page-container relative py-20 md:py-28">

        {/* ── Section header ── */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div>
            <div className="inline-flex items-center gap-2.5 mb-4 px-3.5 py-1.5 rounded-full bg-primary-50 border border-primary-100">
              <div className="w-1.5 h-1.5 rounded-full bg-primary-600" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-600">
                Features
              </span>
            </div>
            <h2 className="text-[1.65rem] md:text-[2rem] font-bold text-neutral-900 leading-tight tracking-[-0.02em]">
              Built for the daily<br />internship attendance flow
            </h2>
          </div>
          <p className="text-neutral-500 text-[0.9375rem] max-w-[340px] md:text-right leading-relaxed">
            Four interconnected core modules — from location validation to performance recap.
          </p>
        </div>

        {/* ── Feature cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6">
          {FEATURES.map((f, i) => (
            <motion.article
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className={`group relative rounded-2xl border overflow-hidden cursor-default transition-all duration-300
                hover:-translate-y-1 hover:shadow-[0_20px_56px_rgba(14,42,71,0.12)]
                ${f.accentBg} ${f.accentBorder}
                shadow-[0_2px_8px_rgba(14,42,71,0.04)]`}
            >
              {/* Colored top bar — always visible, not just on hover */}
              <div className={`absolute top-0 left-0 right-0 h-[3px] ${f.topBar}`} />

              {/* Subtle inner gradient wash */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent pointer-events-none" />

              <div className="relative p-7 md:p-8">
                {/* Icon + badge row */}
                <div className="flex items-start justify-between mb-7">
                  <div className={`w-12 h-12 rounded-xl ${f.iconBg} ring-4 ${f.iconRing} flex items-center justify-center shrink-0
                    group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300 shadow-md`}>
                    <f.icon size={20} className="text-white" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${f.badge.color}`}>
                      {f.badge.label}
                    </span>
                    <span className={`text-[13px] font-bold tabular-nums ${f.numColor}`}>
                      {f.num}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-[1.125rem] font-bold text-neutral-900 mb-3 tracking-tight">
                  {f.title}
                </h3>
                <p className="text-[0.9375rem] text-neutral-600 leading-relaxed">
                  {f.desc}
                </p>

                {/* Bottom arrow indicator */}
                <div className="mt-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-1 group-hover:translate-x-0">
                  <div className={`w-5 h-px ${f.topBar}`} />
                  <span className="text-[12px] font-semibold text-neutral-500 uppercase tracking-wide">Learn more</span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

      </div>
    </section>
  );
}
