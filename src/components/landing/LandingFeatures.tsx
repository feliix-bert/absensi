'use client';

import { motion } from 'framer-motion';
import { MapPin, QrCode, ClipboardList, BarChart3, ArrowUpRight } from 'lucide-react';

const FEATURES = [
  {
    icon: MapPin,
    title: 'Validasi Lokasi',
    desc: 'Pastikan kamu di radius kantor sebelum absen aktif.',
    tint: 'from-primary-50 to-white',
    iconWrap: 'bg-primary-600',
  },
  {
    icon: QrCode,
    title: 'Absen QR Code',
    desc: 'Scan di area kantor — cepat dan tercatat otomatis.',
    tint: 'from-secondary-50 to-white',
    iconWrap: 'bg-secondary-700',
  },
  {
    icon: ClipboardList,
    title: 'Riwayat Absensi',
    desc: 'Jam masuk, keluar, dan durasi kerja per hari.',
    tint: 'from-emerald-50 to-white',
    iconWrap: 'bg-emerald-500',
  },
  {
    icon: BarChart3,
    title: 'Dashboard Rekap',
    desc: 'Statistik kehadiran dan progress magang mingguan.',
    tint: 'from-amber-50 to-white',
    iconWrap: 'bg-amber-500',
  },
];

export function LandingFeatures() {
  return (
    <section id="fitur" className="section-muted py-20 md:py-24 scroll-mt-20">
      <div className="page-container">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div className="max-w-xl">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary-600 mb-3">
              Fitur
            </span>
            <h2 className="text-2xl md:text-[1.75rem] font-bold text-neutral-900 leading-tight">
              Dibuat untuk alur absensi harian magang
            </h2>
          </div>
          <p className="text-neutral-600 text-sm md:text-base max-w-md md:text-right leading-relaxed">
            Empat modul inti yang saling terhubung — dari validasi lokasi hingga rekap performa.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
          {FEATURES.map((f, i) => (
            <motion.article
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className={`group relative overflow-hidden rounded-3xl border border-neutral-200/70 bg-gradient-to-br ${f.tint} p-6 md:p-7 shadow-[0_4px_24px_rgba(14,42,71,0.06)] hover:shadow-[0_12px_40px_rgba(14,42,71,0.1)] transition-shadow duration-300`}
            >
              <div className="flex items-start justify-between gap-4 mb-5">
                <div className={`w-12 h-12 rounded-2xl ${f.iconWrap} flex items-center justify-center shadow-lg`}>
                  <f.icon size={22} className="text-white" />
                </div>
                <span className="w-9 h-9 rounded-full bg-white/80 border border-neutral-100 flex items-center justify-center text-neutral-400 group-hover:text-primary-600 group-hover:border-primary-100 transition-colors">
                  <ArrowUpRight size={16} />
                </span>
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">{f.title}</h3>
              <p className="text-neutral-600 text-sm leading-relaxed">{f.desc}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
