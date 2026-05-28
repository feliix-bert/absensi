'use client';

import { motion } from 'framer-motion';
import { UserPlus, MapPin, QrCode, CheckCircle } from 'lucide-react';

const STEPS = [
  {
    num: '01',
    icon: UserPlus,
    title: 'Daftar akun',
    desc: 'Isi data magang dan lokasi kantor dalam dua langkah singkat.',
    bg: 'bg-secondary-800',
    iconBg: 'bg-secondary-600',
    accentColor: '#1A5580',
    lightBg: 'bg-secondary-50',
    lightBorder: 'border-secondary-100',
    numGradient: 'from-secondary-100 to-secondary-200',
    tag: 'Langkah 1',
    tagColor: 'bg-secondary-100 text-secondary-700',
  },
  {
    num: '02',
    icon: MapPin,
    title: 'Validasi lokasi',
    desc: 'Izinkan GPS agar sistem memverifikasi radius kantor secara akurat.',
    bg: 'bg-primary-700',
    iconBg: 'bg-primary-500',
    accentColor: '#CC0000',
    lightBg: 'bg-primary-50',
    lightBorder: 'border-primary-100',
    numGradient: 'from-primary-100 to-primary-200',
    tag: 'Langkah 2',
    tagColor: 'bg-primary-100 text-primary-700',
  },
  {
    num: '03',
    icon: QrCode,
    title: 'Scan & selesai',
    desc: 'Scan QR di kantor — absensi masuk dan keluar tercatat otomatis.',
    bg: 'bg-success-700',
    iconBg: 'bg-success-500',
    accentColor: '#059669',
    lightBg: 'bg-success-50',
    lightBorder: 'border-success-100',
    numGradient: 'from-success-100 to-success-200',
    tag: 'Langkah 3',
    tagColor: 'bg-success-100 text-success-700',
  },
];

export function LandingSteps() {
  return (
    <section id="cara-kerja" className="scroll-mt-20 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #EEF2F7 0%, #E8EDF4 100%)' }}>

      {/* Soft geometric accent */}
      <div
        className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #0E2A47 1px, transparent 0)`,
          backgroundSize: '44px 44px',
        }}
        aria-hidden
      />

      {/* Section divider top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neutral-300 to-transparent" aria-hidden />

      <div className="page-container relative z-10 py-20 md:py-28">

        {/* ── Section header ── */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-16">
          <div>
            <div className="inline-flex items-center gap-2.5 mb-4 px-3.5 py-1.5 rounded-full bg-secondary-100 border border-secondary-200">
              <div className="w-1.5 h-1.5 rounded-full bg-secondary-600" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary-600">
                Cara Kerja
              </span>
            </div>
            <h2 className="text-[1.65rem] md:text-[2rem] font-bold text-neutral-900 leading-tight tracking-[-0.02em]">
              Tiga langkah, absensi selesai
            </h2>
          </div>
          <p className="text-neutral-500 text-[0.875rem] max-w-[280px] md:text-right leading-relaxed">
            Dari pendaftaran hingga scan QR — cukup sekali setup, langsung jalan.
          </p>
        </div>

        {/* ── Steps grid — alternating tinted dark/light panels ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 relative">

          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-[3.5rem] left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-[2px] pointer-events-none" aria-hidden>
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
              className="h-full origin-left"
              style={{ background: 'linear-gradient(90deg, #1A5580, #CC0000, #059669)' }}
            />
          </div>

          {STEPS.map((s, i) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="group"
            >
              {/* Dark tinted panel */}
              <div className={`relative rounded-2xl overflow-hidden transition-all duration-300
                hover:-translate-y-1.5 hover:shadow-2xl cursor-default
                ${s.bg} shadow-[0_4px_24px_rgba(0,0,0,0.12)]`}
              >
                {/* Inner glow */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: `radial-gradient(ellipse 80% 60% at 90% 10%, rgba(255,255,255,0.07) 0%, transparent 70%)` }}
                  aria-hidden
                />

                {/* Grid texture */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-[0.04]"
                  style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)`,
                    backgroundSize: '32px 32px',
                  }}
                  aria-hidden
                />

                <div className="relative p-7 md:p-8">
                  {/* Icon + step tag */}
                  <div className="flex items-center justify-between mb-8">
                    <div className={`w-12 h-12 rounded-xl ${s.iconBg} flex items-center justify-center shadow-lg
                      group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300`}>
                      <s.icon size={20} className="text-white" />
                    </div>
                    <span className="text-[4rem] font-bold text-white/[0.10] tabular-nums leading-none select-none">
                      {s.num}
                    </span>
                  </div>

                  <h3 className="text-[1.125rem] font-bold text-white mb-2.5 tracking-tight">
                    {s.title}
                  </h3>
                  <p className="text-[0.9rem] text-white/60 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>

              {/* Light tag below dark panel */}
              <div className={`mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl border ${s.lightBg} ${s.lightBorder}`}>
                <CheckCircle size={13} className="text-current shrink-0" style={{ color: s.accentColor }} />
                <span className="text-[12px] font-semibold" style={{ color: s.accentColor }}>
                  {s.tag}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Bottom callout strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 py-5 px-6 rounded-2xl bg-white/70 border border-white shadow-sm backdrop-blur-sm text-center sm:text-left"
        >
          <CheckCircle size={18} className="text-success-500 shrink-0" />
          <p className="text-[0.9rem] text-neutral-700">
            <span className="font-semibold text-neutral-900">Tidak perlu instalasi. </span>
            Berjalan langsung di browser — desktop maupun mobile.
          </p>
        </motion.div>

      </div>
    </section>
  );
}
