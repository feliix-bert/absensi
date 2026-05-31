'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Users, Building2, Clock } from 'lucide-react';

const TRUST_STATS = [
  { icon: Users, value: '500+', label: 'Active interns' },
  { icon: Building2, value: '12', label: 'Telkom divisions' },
  { icon: Clock, value: '99.9%', label: 'System uptime' },
];

export function LandingCta() {
  return (
    <section className="relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #061828 0%, #0A2239 40%, #0E2A47 70%, #0F2C4A 100%)' }}>

      {/* Structural grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }}
        aria-hidden
      />

      {/* Red radial glow — top right */}
      <div
        className="absolute top-[-30%] right-[-5%] w-[55%] h-[160%] rounded-full opacity-[0.12] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #CC0000 0%, transparent 60%)' }}
        aria-hidden
      />

      {/* Blue radial glow — bottom left */}
      <div
        className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[100%] rounded-full opacity-[0.08] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #1A5580 0%, transparent 60%)' }}
        aria-hidden
      />

      {/* Top edge rule */}
      <div className="absolute top-0 left-0 right-0 h-px bg-white/[0.08]" aria-hidden />

      {/* Red top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary-700 via-primary-500 to-primary-700" aria-hidden />

      <div className="page-container relative z-10 py-20 md:py-28">

        {/* ── Trust stats strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap justify-center gap-3 mb-16"
        >
          {TRUST_STATS.map((t, i) => (
            <motion.div
              key={t.label}
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="flex items-center gap-3 px-5 py-3 rounded-xl border border-white/[0.1] bg-white/[0.04] backdrop-blur-sm"
            >
              <div className="w-8 h-8 rounded-lg bg-primary-600/20 border border-primary-500/30 flex items-center justify-center shrink-0">
                <t.icon size={14} className="text-primary-400" />
              </div>
              <div>
                <div className="text-[1.0625rem] font-bold text-white tabular-nums leading-tight">{t.value}</div>
                <div className="text-[0.75rem] text-white/40 leading-none mt-0.5">{t.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Main CTA block ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-3xl overflow-hidden border border-white/[0.08]"
          style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(4px)' }}
        >
          {/* Inner card glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 70% 60% at 90% 50%, rgba(204,0,0,0.07) 0%, transparent 70%)' }}
            aria-hidden
          />

          {/* Horizontal rule from left with red accent */}
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-primary-600 via-primary-400 to-primary-700" aria-hidden />

          <div className="relative px-8 md:px-14 py-12 md:py-16 flex flex-col md:flex-row md:items-center md:justify-between gap-10">

            {/* Left: copy */}
            <div className="max-w-lg">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-1 h-3.5 bg-primary-500 rounded-full" />
                <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
                  Ready to Start?
                </span>
              </div>

              <h2 className="text-[1.8rem] md:text-[2.25rem] font-bold text-white leading-[1.1] tracking-[-0.02em] mb-5">
                Neat internship attendance,<br className="hidden md:block" /> starts today.
              </h2>
              <p className="text-white/45 text-[0.9375rem] md:text-[1rem] leading-relaxed max-w-[420px]">
                Join Telkom Indonesia interns and record attendance in a more structured way.
              </p>

              {/* Feature bullets */}
              <div className="mt-7 flex flex-col gap-2.5">
                {['No installation needed', 'Free for all interns', 'Data stored securely'].map((item) => (
                  <div key={item} className="flex items-center gap-2.5">
                    <CheckCircle2 size={14} className="text-success-400 shrink-0" />
                    <span className="text-[0.875rem] text-white/50 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: CTA block */}
            <div className="flex flex-col items-start md:items-end gap-4 shrink-0">

              {/* Primary CTA card */}
              <div className="w-full md:w-auto flex flex-col gap-3 p-6 rounded-2xl border border-white/[0.1] bg-white/[0.05]">
                <p className="text-[0.8125rem] text-white/40 font-medium mb-1">Start in 2 minutes</p>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-white text-neutral-900 text-[0.9375rem] font-bold
                    shadow-[0_4px_24px_rgba(204,0,0,0.2)] hover:shadow-[0_8px_36px_rgba(204,0,0,0.3)]
                    hover:bg-neutral-50 active:scale-[0.97] transition-all duration-300 group relative overflow-hidden"
                  id="cta-section-signup"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-500/[0.04] to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                  <span className="relative">Sign Up Free</span>
                  <div className="w-6 h-6 rounded-md bg-neutral-100 flex items-center justify-center shrink-0 group-hover:bg-primary-50 transition-colors duration-300 relative">
                    <ArrowRight size={14} className="text-neutral-700 group-hover:text-primary-600 transition-colors duration-300" />
                  </div>
                </Link>

                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/[0.12] text-white/60 text-[0.875rem] font-medium
                    hover:bg-white/[0.05] hover:text-white hover:border-white/[0.2] transition-all duration-300"
                >
                  Already have an account? Log in
                </Link>

                <div className="flex items-center justify-center gap-2 mt-1">
                  <CheckCircle2 size={12} className="text-success-400 shrink-0" />
                  <span className="text-[0.75rem] text-white/30 font-medium">Free, no credit card required</span>
                </div>
              </div>

            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
