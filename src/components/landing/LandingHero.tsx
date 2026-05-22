'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, MapPin, Zap } from 'lucide-react';
import { useMounted } from '@/hooks/useMounted';
import { HeroPreview } from './HeroPreview';

export function LandingHero() {
  const mounted = useMounted();

  return (
    <section className="relative hero-mesh overflow-hidden pt-[4.25rem]">
      <div className="absolute inset-0 hero-grid opacity-60 pointer-events-none" aria-hidden />
      <div className="absolute top-0 right-0 w-[min(600px,70vw)] h-[min(600px,70vw)] rounded-full bg-primary-600/10 blur-3xl -translate-y-1/3 translate-x-1/4 pointer-events-none" aria-hidden />
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-secondary-500/15 blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" aria-hidden />

      <div className="page-container relative py-16 md:py-20 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Copy */}
          <div>
            <motion.div
              initial={mounted ? { opacity: 0, y: 12 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
              <span className="text-white/90 text-xs font-medium tracking-wide">
                Platform Resmi Peserta Magang Telkom
              </span>
            </motion.div>

            <motion.h1
              initial={mounted ? { opacity: 0, y: 16 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="text-[2rem] sm:text-4xl lg:text-[2.75rem] xl:text-5xl font-bold text-white leading-[1.15] mb-5 text-balance"
            >
              Absensi magang yang{' '}
              <span className="text-primary-400">tepat waktu</span>,{' '}
              terverifikasi lokasi
            </motion.h1>

            <motion.p
              initial={mounted ? { opacity: 0, y: 16 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-base md:text-lg text-white/75 max-w-lg leading-relaxed mb-8"
            >
              Catat kehadiran dengan GPS dan QR Code dalam satu aplikasi.
              Transparan untuk peserta magang, mudah dipantau pembimbing.
            </motion.p>

            <motion.div
              initial={mounted ? { opacity: 0, y: 16 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Link href="/signup" className="btn-hero-primary group justify-center">
                Mulai Sekarang
                <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link href="/login" className="btn-hero-ghost justify-center">
                Sudah punya akun? Masuk
              </Link>
            </motion.div>

            <motion.ul
              initial={mounted ? { opacity: 0 } : false}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="mt-10 flex flex-wrap gap-x-6 gap-y-3"
            >
              {[
                { icon: ShieldCheck, text: 'Data terenkripsi' },
                { icon: MapPin, text: 'Validasi radius kantor' },
                { icon: Zap, text: 'Proses < 3 detik' },
              ].map((item) => (
                <li key={item.text} className="flex items-center gap-2 text-white/70 text-sm">
                  <item.icon size={15} className="text-primary-400 shrink-0" />
                  {item.text}
                </li>
              ))}
            </motion.ul>
          </div>

          {/* Preview */}
          <motion.div
            initial={mounted ? { opacity: 0, y: 24 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="relative lg:pl-4"
          >
            <HeroPreview />
          </motion.div>
        </div>
      </div>

      {/* Wave to light section */}
      <div className="relative h-14 md:h-20 pointer-events-none" aria-hidden>
        <svg viewBox="0 0 1440 80" className="absolute bottom-0 w-full h-full" preserveAspectRatio="none">
          <path
            d="M0,80 L0,40 C360,80 480,0 720,32 C960,64 1080,16 1440,48 L1440,80 Z"
            fill="#FAFBFC"
          />
        </svg>
      </div>
    </section>
  );
}
