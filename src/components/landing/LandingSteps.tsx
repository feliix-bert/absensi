'use client';

import { motion } from 'framer-motion';

const STEPS = [
  {
    step: '01',
    title: 'Daftar akun',
    desc: 'Isi data magang dan lokasi kantor dalam dua langkah singkat.',
  },
  {
    step: '02',
    title: 'Validasi lokasi',
    desc: 'Izinkan GPS agar sistem memverifikasi radius kantor.',
  },
  {
    step: '03',
    title: 'Scan & selesai',
    desc: 'Scan QR di kantor — absensi masuk dan keluar tercatat.',
  },
];

export function LandingSteps() {
  return (
    <section id="cara-kerja" className="py-20 md:py-24 bg-white scroll-mt-20">
      <div className="page-container">
        <div className="text-center max-w-xl mx-auto mb-14 md:mb-16">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary-600 mb-3">
            Cara Kerja
          </span>
          <h2 className="text-2xl md:text-[1.75rem] font-bold text-neutral-900">
            Tiga langkah, absensi selesai
          </h2>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div
            className="hidden md:block absolute top-[1.75rem] left-[calc(16.67%+1.75rem)] right-[calc(16.67%+1.75rem)] h-px bg-neutral-200"
            aria-hidden
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-secondary-800 text-white flex items-center justify-center text-sm font-bold mb-5 shadow-[0_8px_20px_rgba(14,42,71,0.2)] relative z-10 tabular-nums">
                  {s.step}
                </div>
                <h3 className="text-base font-bold text-neutral-900 mb-2">{s.title}</h3>
                <p className="text-neutral-600 text-sm leading-relaxed max-w-[220px] mx-auto">
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
