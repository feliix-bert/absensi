'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, Calendar, MapPin, Clock, ChevronDown } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { getAttendanceHistory } from '@/actions/attendance.actions';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { cn } from '@/lib/utils';
import type { AttendanceStatus } from '@/lib/types';
import { useAuthStore } from '@/features/auth/store/authStore';

type FilterStatus = 'semua' | AttendanceStatus;

const FILTERS: { key: FilterStatus; label: string }[] = [
  { key: 'semua', label: 'Semua' },
  { key: 'hadir', label: 'Hadir' },
  { key: 'terlambat', label: 'Terlambat' },
  { key: 'izin', label: 'Izin' },
  { key: 'alpha', label: 'Alpha' },
];

function formatMonthLabel(ym: string) {
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
}

export default function HistoryPage() {
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('semua');
  const profile = useAuthStore(state => state.profile);

  const availableMonths = useMemo(() => {
    const months = [];
    if (profile?.mulai_magang && profile?.selesai_magang) {
      const start = new Date(profile.mulai_magang);
      const end = new Date(profile.selesai_magang);
      let curr = new Date(start.getFullYear(), start.getMonth(), 1);
      const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
      
      while (curr <= endMonth) {
        months.push(`${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, '0')}`);
        curr.setMonth(curr.getMonth() + 1);
      }
      // Ensure current month is always present if it's not empty, or reverse it so newest is first
      months.reverse();
    }
    
    if (months.length === 0) {
      for (let i = 0; i < 4; i++) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
      }
    }
    return months;
  }, [profile]);
  
  const [activeMonth, setActiveMonth] = useState('');
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (availableMonths.length > 0 && !activeMonth) {
      setActiveMonth(availableMonths[0]);
    }
  }, [availableMonths, activeMonth]);

  useEffect(() => {
    if (!activeMonth) return;
    async function load() {
      setIsLoading(true);
      const data = await getAttendanceHistory(activeMonth);
      setHistoryData(data);
      setIsLoading(false);
    }
    load();
  }, [activeMonth]);

  const filtered = historyData.filter(r => {
    if (activeFilter === 'semua') return true;
    return r.status.toLowerCase() === activeFilter.toLowerCase();
  });

  // Calculate stats for the current month
  const totalDays = 30; // approx
  const attendedDays = historyData.filter(r => r.status === 'Hadir').length;
  const lateDays = historyData.filter(r => r.status === 'Terlambat').length;
  const izinDays = historyData.filter(r => r.status === 'Izin' || r.status === 'Sakit').length;
  const alphaDays = historyData.filter(r => r.status === 'Alpha' || r.status === 'Absen').length;
  const totalRelevant = attendedDays + lateDays + alphaDays;
  const attendanceRate = totalRelevant === 0 ? 100 : Math.round(((attendedDays + lateDays) / totalRelevant) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* ─── Monthly Overview Card ─── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl bg-secondary-700 text-white p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-secondary-300 text-body-sm">{activeMonth ? formatMonthLabel(activeMonth) : 'Memuat...'}</p>
            <p className="text-2xl font-bold mt-0.5">
              {attendedDays} <span className="text-secondary-300 text-lg font-normal">/ {totalDays} hari</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
            <Calendar size={22} className="text-white" />
          </div>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${attendanceRate}%` }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="h-full bg-primary-500 rounded-full"
          />
        </div>
        <div className="grid grid-cols-4 gap-2 mt-4">
          {[
            { label: 'Hadir', value: attendedDays, color: 'text-success-400' },
            { label: 'Telat', value: lateDays, color: 'text-warning-400' },
            { label: 'Izin', value: izinDays, color: 'text-blue-400' },
            { label: 'Alpha', value: alphaDays, color: 'text-danger-400' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[11px] text-secondary-400">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ─── Month Tabs ─── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1"
      >
        <Calendar size={15} className="text-neutral-400 flex-shrink-0" />
        {availableMonths.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setActiveMonth(m)}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-label-sm transition-all duration-150 whitespace-nowrap flex-shrink-0',
              activeMonth === m
                ? 'bg-secondary-700 text-white shadow-sm'
                : 'bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-300'
            )}
          >
            {formatMonthLabel(m)}
          </button>
        ))}
      </motion.div>

      {/* ─── Filter Pills ─── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1"
      >
        <Filter size={15} className="text-neutral-400 flex-shrink-0" />
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={cn(
              'px-3.5 py-1.5 rounded-full text-label-sm transition-all duration-150 whitespace-nowrap flex-shrink-0',
              activeFilter === f.key
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-300'
            )}
          >
            {f.label}
          </button>
        ))}
      </motion.div>

      {isLoading ? (
        <div className="text-center py-10 text-neutral-400">Memuat...</div>
      ) : filtered.length === 0 ? (
        <EmptyState variant="history" />
      ) : (
        <div className="space-y-2.5">
          {filtered.map((record, i) => {
            const date = new Date(record.check_in);
            const dayName = date.toLocaleDateString('id-ID', { weekday: 'short' });
            const dayNum = date.getDate();
            const monthName = date.toLocaleDateString('id-ID', { month: 'short' });
            
            const checkInTime = new Date(record.check_in).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            const checkOutTime = record.check_out ? new Date(record.check_out).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : null;

            return (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.04, duration: 0.3 }}
                className="card p-4"
              >
                <div className="flex items-start gap-4">
                  {/* Date column */}
                  <div className="flex-shrink-0 text-center w-12">
                    <p className="text-[10px] uppercase font-semibold text-neutral-400">{dayName}</p>
                    <p className="text-2xl font-bold text-neutral-900 leading-tight">{dayNum}</p>
                    <p className="text-[11px] text-neutral-400">{monthName}</p>
                  </div>

                  {/* Vertical separator */}
                  <div className="w-px self-stretch bg-neutral-100 flex-shrink-0" />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <StatusBadge status={record.status} />
                      {record.isLate && (
                        <span className="text-[10px] text-warning-600 font-medium bg-warning-50 px-2 py-0.5 rounded-full">
                          Terlambat
                        </span>
                      )}
                    </div>

                    {record.check_in ? (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} className="text-success-500" />
                          <span className="text-body-sm text-neutral-700 font-medium">Masuk: {checkInTime}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} className="text-neutral-400" />
                          <span className="text-body-sm text-neutral-500">
                            Keluar: {checkOutTime ?? '—'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      record.notes && (
                        <p className="text-body-sm text-neutral-500 italic">{record.notes}</p>
                      )
                    )}

                    <div className="flex items-center gap-3 mt-2">
                      {record.location !== '-' && (
                        <div className="flex items-center gap-1">
                          <MapPin size={11} className="text-neutral-400" />
                          <span className="text-[11px] text-neutral-400 truncate">{record.location}</span>
                        </div>
                      )}
                      {record.duration && (
                        <span className="text-[11px] text-neutral-400 ml-auto font-medium">{record.duration}</span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Load more */}
      {filtered.length > 0 && (
        <button className="btn btn-outline btn-full btn-md mt-2">
          <ChevronDown size={16} /> Muat Lebih Banyak
        </button>
      )}
    </div>
  );
}
