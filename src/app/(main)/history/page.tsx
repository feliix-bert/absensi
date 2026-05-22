'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, Calendar, MapPin, Clock, ChevronDown } from 'lucide-react';
import { MOCK_STATS } from '@/lib/mock-data';
import { useAttendance } from '@/hooks/useAttendance';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { cn } from '@/lib/utils';
import type { AttendanceStatus } from '@/lib/types';

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
  const { filterByStatus, availableMonths } = useAttendance();
  const [activeMonth, setActiveMonth] = useState(availableMonths[0] ?? '2025-05');

  const filtered = filterByStatus(activeFilter).filter((r) =>
    r.date.startsWith(activeMonth)
  );

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
            <p className="text-secondary-300 text-body-sm">{formatMonthLabel(activeMonth)}</p>
            <p className="text-2xl font-bold mt-0.5">
              {MOCK_STATS.attendedDays} <span className="text-secondary-300 text-lg font-normal">/ {MOCK_STATS.totalDays} hari</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
            <Calendar size={22} className="text-white" />
          </div>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${MOCK_STATS.attendanceRate}%` }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="h-full bg-primary-500 rounded-full"
          />
        </div>
        <div className="grid grid-cols-4 gap-2 mt-4">
          {[
            { label: 'Hadir', value: MOCK_STATS.attendedDays, color: 'text-success-400' },
            { label: 'Telat', value: MOCK_STATS.lateDays, color: 'text-warning-400' },
            { label: 'Izin', value: MOCK_STATS.izinDays, color: 'text-blue-400' },
            { label: 'Alpha', value: MOCK_STATS.alphaDays, color: 'text-danger-400' },
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

      {/* ─── History List ─── */}
      {filtered.length === 0 ? (
        <EmptyState variant="history" />
      ) : (
        <div className="space-y-2.5">
          {filtered.map((record, i) => {
            const date = new Date(record.date);
            const dayName = date.toLocaleDateString('id-ID', { weekday: 'short' });
            const dayNum = date.getDate();
            const monthName = date.toLocaleDateString('id-ID', { month: 'short' });

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

                    {record.checkIn ? (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} className="text-success-500" />
                          <span className="text-body-sm text-neutral-700 font-medium">Masuk: {record.checkIn}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} className="text-neutral-400" />
                          <span className="text-body-sm text-neutral-500">
                            Keluar: {record.checkOut ?? '—'}
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
