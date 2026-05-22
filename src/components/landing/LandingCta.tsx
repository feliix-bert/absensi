'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

export function LandingCta() {
  return (
    <section className="py-16 md:py-20">
      <div className="page-container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-primary-600 px-8 py-12 md:px-14 md:py-14 text-center"
        >
          <div className="absolute inset-0 opacity-20 pointer-events-none" aria-hidden>
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-white" />
          </div>
          <div className="relative">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Siap mulai absensi lebih rapi?
            </h2>
            <p className="text-primary-100 text-base md:text-lg mb-8 max-w-md mx-auto">
              Bergabung dengan peserta magang Telkom yang sudah menggunakan TelIntern setiap hari.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-primary-600 font-semibold text-base shadow-lg hover:bg-neutral-50 transition-colors"
            >
              Daftar Gratis
              <ChevronRight size={18} />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
