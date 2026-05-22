'use client';

import { motion } from 'framer-motion';
import {
  User, Hash, Briefcase, GraduationCap, Calendar,
  MapPin, Mail, LogOut, ChevronRight, Edit3,
  ShieldCheck, Bell
} from 'lucide-react';
import { MOCK_USER, MOCK_STATS } from '@/lib/mock-data';
import {
  getInitials, formatDateShort, getInternshipProgress, getRemainingDays
} from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface InfoRowProps {
  icon: React.ElementType;
  label: string;
  value: string;
  className?: string;
}

function InfoRow({ icon: Icon, label, value, className }: InfoRowProps) {
  return (
    <div className={cn('flex items-start gap-3 py-3.5 border-b border-neutral-100 last:border-0', className)}>
      <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={15} className="text-neutral-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-neutral-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-body-md text-neutral-900 font-medium mt-0.5 leading-snug">{value}</p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { logout } = useAuth();
  const progress = getInternshipProgress(MOCK_USER.startDate, MOCK_USER.endDate);
  const remaining = getRemainingDays(MOCK_USER.endDate);

  const handleLogout = () => {
    if (confirm('Yakin ingin keluar?')) {
      logout();
      window.location.href = '/login';
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* ─── Profile Card ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl bg-secondary-700 text-white p-6 relative overflow-hidden"
      >
        {/* BG decoration */}
        <div className="absolute right-0 top-0 w-32 h-full opacity-5 pointer-events-none">
          <div className="absolute right-4 top-4 w-20 h-20 rounded-full border border-white" />
          <div className="absolute right-0 bottom-0 w-28 h-28 rounded-full border border-white" />
        </div>

        <div className="relative flex items-center gap-5">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-primary-600/30 border-2 border-primary-500/40 flex items-center justify-center text-white text-2xl font-bold">
              {getInitials(MOCK_USER.name)}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-success-500 border-2 border-secondary-700 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-white leading-tight">{MOCK_USER.name}</h2>
            <p className="text-secondary-300 text-body-sm mt-0.5">{MOCK_USER.nim}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="badge badge-navy border border-white/10 text-xs">{MOCK_USER.division}</span>
              <span className="badge bg-success-600/20 text-success-400 text-xs">Aktif</span>
            </div>
          </div>

          <button className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors flex-shrink-0">
            <Edit3 size={15} className="text-white" />
          </button>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-white/10">
          {[
            { label: 'Kehadiran', value: `${MOCK_STATS.attendanceRate}%` },
            { label: 'Sisa Hari', value: `${remaining}` },
            { label: 'Streak', value: `${MOCK_STATS.streakDays}h` },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-lg font-bold text-white">{s.value}</p>
              <p className="text-[11px] text-secondary-400">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ─── Internship Progress ─── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08 }}
        className="card p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-label-lg text-neutral-700">Durasi Magang</span>
          <span className="text-label-lg text-primary-600 font-bold">{progress}%</span>
        </div>
        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden mb-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
            className="h-full bg-primary-600 rounded-full"
          />
        </div>
        <div className="flex justify-between text-[11px] text-neutral-400">
          <span>Mulai: {formatDateShort(MOCK_USER.startDate)}</span>
          <span>Selesai: {formatDateShort(MOCK_USER.endDate)}</span>
        </div>
      </motion.div>

      {/* ─── Personal Info ─── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.12 }}
        className="card px-5"
      >
        <h3 className="text-label-sm text-neutral-400 uppercase tracking-wide py-3 border-b border-neutral-100">
          Informasi Magang
        </h3>
        <InfoRow icon={User} label="Nama Lengkap" value={MOCK_USER.name} />
        <InfoRow icon={Hash} label="NIM / ID Magang" value={MOCK_USER.nim} />
        <InfoRow icon={Briefcase} label="Divisi" value={MOCK_USER.division} />
        <InfoRow icon={GraduationCap} label="Pembimbing" value={MOCK_USER.mentor} />
        <InfoRow
          icon={Calendar}
          label="Periode Magang"
          value={`${formatDateShort(MOCK_USER.startDate)} — ${formatDateShort(MOCK_USER.endDate)}`}
        />
        <InfoRow icon={MapPin} label="Lokasi Kantor" value={MOCK_USER.officeLocation} />
        <InfoRow icon={Mail} label="Email" value={MOCK_USER.email} />
      </motion.div>

      {/* ─── Settings Options ─── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.16 }}
        className="card divide-y divide-neutral-100"
      >
        {[
          { icon: Bell, label: 'Notifikasi', desc: 'Pengaturan pemberitahuan' },
          { icon: ShieldCheck, label: 'Keamanan', desc: 'Ubah password' },
        ].map((item) => (
          <button
            key={item.label}
            className="flex items-center gap-3 w-full px-5 py-4 hover:bg-neutral-50 transition-colors text-left"
          >
            <div className="w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
              <item.icon size={16} className="text-neutral-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-body-md font-medium text-neutral-900">{item.label}</p>
              <p className="text-body-sm text-neutral-400">{item.desc}</p>
            </div>
            <ChevronRight size={16} className="text-neutral-300" />
          </button>
        ))}
      </motion.div>

      {/* ─── Logout ─── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <button
          id="profile-logout"
          onClick={handleLogout}
          className="btn btn-danger btn-full btn-lg w-full"
        >
          <LogOut size={18} /> Keluar dari Akun
        </button>
      </motion.div>

      {/* ─── Version ─── */}
      <p className="text-center text-body-sm text-neutral-300 pb-2">
        TelIntern v1.0.0 · © 2025 Telkom Indonesia
      </p>
    </div>
  );
}
