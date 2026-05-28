'use client';

import Link from 'next/link';
import { useRef } from 'react';
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  useInView,
} from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { HeroPreview } from './HeroPreview';

/* ─── Animation presets ─── */
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

/* ─── Metrics for the frame bottom strip ─── */
const METRICS = [
  { value: '94%', label: 'Kehadiran' },
  { value: '< 3s', label: 'Proses' },
  { value: 'GPS', label: 'Terverifikasi' },
];

export function LandingHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-60px' });

  /* Mouse tracking — normalised -0.5 … 0.5 */
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 45, damping: 18 });
  const springY = useSpring(mouseY, { stiffness: 45, damping: 18 });

  /* 3-D tilt for the editorial frame */
  const rotateY = useTransform(springX, [-0.5, 0.5], [-3.5, 3.5]);
  const rotateX = useTransform(springY, [-0.5, 0.5], [2.5, -2.5]);

  /* Secondary parallax for the inner card — moves slightly less than the frame */
  const cardX = useTransform(springX, [-0.5, 0.5], [-5, 5]);
  const cardY = useTransform(springY, [-0.5, 0.5], [-3, 3]);

  function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <section
      ref={sectionRef}
      className="hero-v2-bg relative overflow-hidden pt-[4.25rem]"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      aria-label="Hero"
    >
      {/* Structural grid overlay — depth without decoration */}
      <div className="hero-grid-overlay absolute inset-0 pointer-events-none" aria-hidden />

      {/* Top edge rule */}
      <div
        className="absolute top-[4.25rem] left-0 right-0 h-px bg-white/[0.07] pointer-events-none"
        aria-hidden
      />

      <div className="page-container relative">
        <div className="grid lg:grid-cols-[1fr_460px] xl:grid-cols-[1fr_500px] gap-10 xl:gap-14 min-h-[calc(100vh-4.25rem)] py-16 md:py-20 lg:py-0 items-center">

          {/* ══════════════ LEFT: COPY ══════════════ */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate={isInView ? 'show' : 'hidden'}
            className="flex flex-col items-center lg:items-start text-center lg:text-left max-w-2xl mx-auto lg:mx-0 lg:max-w-none justify-center lg:py-24"
          >


            {/* H1 — clean, no faded-word trick */}
            <motion.h1
              variants={fadeUp}
              className="text-[2.5rem] sm:text-[3rem] lg:text-[3.2rem] xl:text-[3.65rem] font-bold text-white leading-[1.06] tracking-[-0.025em] mb-6 text-balance"
            >
              Absensi magang<br />
              yang{' '}
              <span className="hero-headline-accent">tepat waktu</span>
              <br />
              &amp; terverifikasi.
            </motion.h1>

            {/* Body copy */}
            <motion.p
              variants={fadeUp}
              className="text-[1rem] md:text-[1.0625rem] text-white/50 leading-[1.72] max-w-[440px] mx-auto lg:mx-0 mb-10"
            >
              Catat kehadiran lewat GPS dan QR Code dalam satu alur.
              Transparan untuk peserta, mudah dipantau pembimbing.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-10">
              <Link
                href="/signup"
                className="hero-cta-primary group"
                id="hero-cta-signup"
              >
                <span>Mulai Sekarang</span>
                <ArrowRight
                  size={15}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>
              <Link
                href="/login"
                className="hero-cta-ghost"
                id="hero-cta-login"
              >
                Masuk ke akun
              </Link>
            </motion.div>

            {/* Trust line — single, factual, grounded */}
            <motion.div variants={fadeUp} className="flex items-center gap-2.5">
              <CheckCircle2 size={14} className="text-success-400 shrink-0" />
              <p className="text-[0.8125rem] text-white/40 leading-snug">
                Gratis untuk seluruh peserta magang{' '}
                <span className="text-white/60 font-medium">Telkom Indonesia</span>
              </p>
            </motion.div>
          </motion.div>

          {/* ══════════════ RIGHT: EDITORIAL FRAME ══════════════ */}
          {/*
            Perspective is set on the wrapper div so that rotateX/rotateY
            on the inner motion.div creates genuine 3-D depth tilt.
          */}
          <div
            className="hidden md:flex items-center justify-center lg:justify-end mt-8 lg:mt-0 w-full max-w-[560px] mx-auto lg:max-w-none"
            style={{ perspective: '1200px' }}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.65, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
              style={{ rotateY, rotateX }}
              className="w-full"
            >
              <div className="hero-editorial-frame">

                {/* Chrome header bar — gives the frame a product/browser feel */}
                <div className="hero-frame-bar">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-white/[0.12]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-white/[0.12]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-white/[0.12]" />
                  </div>
                  <span className="text-[11px] font-medium text-white/25 tracking-wide">
                    TelIntern · Dashboard Peserta
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-success-400 inline-block animate-pulse"
                      aria-hidden
                    />
                    <span className="text-[10px] text-white/30">Live</span>
                  </div>
                </div>

                {/* HeroPreview card with inner parallax layer */}
                <motion.div style={{ x: cardX, y: cardY }} className="px-4 py-3.5">
                  <HeroPreview />
                </motion.div>

                {/* Metrics strip — replaces floating badges, feels like product data */}
                <div className="hero-metrics-strip">
                  {METRICS.map(({ value, label }, i) => (
                    <div key={label} className="hero-metric-cell">
                      {i > 0 && <div className="hero-metric-divider" aria-hidden />}
                      <span className="hero-metric-value">{value}</span>
                      <span className="hero-metric-label">{label}</span>
                    </div>
                  ))}
                </div>

              </div>
            </motion.div>
          </div>

          {/* ── Mobile: card only, no frame ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="md:hidden mt-4"
          >
            <HeroPreview />
          </motion.div>

        </div>
      </div>

      {/* Bottom edge rule */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" aria-hidden />
    </section>
  );
}
