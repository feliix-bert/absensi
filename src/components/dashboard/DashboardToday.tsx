'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CalendarDays, MapPin, QrCode, ChevronRight, XCircle, FileText, CheckCircle2 } from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { submitIzin } from '@/actions/attendance.actions';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLocationStatus } from './DashboardLocationStatus';

interface DashboardTodayProps {
  today: any
  profile: any
}

function IzinModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) {
  const [type, setType] = useState<'Izin' | 'Sakit'>('Izin');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Alasan wajib diisi');
      return;
    }
    setIsLoading(true);
    setError('');
    
    const res = await submitIzin({ type, reason });
    setIsLoading(false);
    
    if (res.error) {
      setError(res.error);
    } else {
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
      >
        <h2 className="text-xl font-bold text-neutral-900 mb-4">Ajukan Izin / Sakit</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Tipe</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType('Izin')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${type === 'Izin' ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}
              >
                Izin
              </button>
              <button
                type="button"
                onClick={() => setType('Sakit')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${type === 'Sakit' ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}
              >
                Sakit
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Alasan</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-3 border border-neutral-200 rounded-xl bg-neutral-50 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[100px]"
              placeholder="Masukkan alasan detail..."
            />
          </div>
          {error && <p className="text-sm text-danger-600 font-medium">{error}</p>}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-2.5 rounded-xl font-semibold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 rounded-xl font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Mengirim...' : 'Kirim'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export function DashboardToday({ today, profile }: DashboardTodayProps) {
  const officeShort = profile?.offices?.nama?.split('(')[1]?.replace(')','') ?? 'kantor';
  const hasCheckedIn = !!today?.check_in;
  const hasCheckedOut = !!today?.check_out;
  const checkInTime = hasCheckedIn ? new Date(today.check_in).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : null;
  const checkOutTime = hasCheckedOut ? new Date(today.check_out).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : null;

  const office = Array.isArray(profile?.offices) ? profile?.offices[0] : profile?.offices;
  const [isIzinModalOpen, setIsIzinModalOpen] = useState(false);

  const handleIzinSuccess = () => {
    setIsIzinModalOpen(false);
    window.location.reload(); // Simple reload to refresh data
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card-modern p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarDays size={18} className="text-neutral-400" />
              <h2 className="text-sm font-semibold text-neutral-800">Absensi Hari Ini</h2>
            </div>
            {!hasCheckedIn && (
               <button 
                 onClick={() => setIsIzinModalOpen(true)}
                 className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded-md hover:bg-primary-100 transition-colors"
               >
                 Ajukan Izin
               </button>
            )}
          </div>
          {hasCheckedIn ? (
            <>
              <StatusBadge status={today.status ?? 'Hadir'} />
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="card-surface p-3">
                  <p className="text-[10px] font-medium text-neutral-500 uppercase tracking-wide">Masuk</p>
                  <p className="text-lg font-bold text-neutral-900 tabular-nums mt-1">
                    {checkInTime ?? '--:--'}
                  </p>
                </div>
                <div className="card-surface p-3">
                  <p className="text-[10px] font-medium text-neutral-500 uppercase tracking-wide">Keluar</p>
                  <p className={`text-lg font-bold tabular-nums mt-1 ${hasCheckedOut ? 'text-neutral-900' : 'text-amber-600'}`}>
                    {checkOutTime ?? 'Belum'}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="py-6 text-center">
              <XCircle size={28} className="text-neutral-300 mx-auto mb-2" />
              <p className="text-sm text-neutral-500">Belum absen masuk hari ini</p>
            </div>
          )}
        </div>

        <div className="card-modern p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={18} className="text-neutral-400" />
              <h2 className="text-sm font-semibold text-neutral-800">Lokasi</h2>
            </div>
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <MapPin size={18} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-800">Lokasi Kantor Anda</p>
                <p className="text-xs text-neutral-500 mt-0.5">{office?.nama || 'Kantor'}</p>
              </div>
            </div>
          </div>
          
          <DashboardLocationStatus office={office} />
        </div>

        <Link href="/scan" className="sm:col-span-2 block group">
          <div className="rounded-2xl bg-primary-600 p-5 flex items-center justify-between hover:bg-primary-500 transition-colors shadow-[0_8px_24px_rgba(204,0,0,0.25)]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
                <QrCode size={22} className="text-white" />
              </div>
              <div>
                <p className="text-white font-bold">
                  {hasCheckedIn && !hasCheckedOut ? 'Absen Keluar' : 'Absen Masuk'}
                </p>
                <p className="text-white/75 text-sm mt-0.5">Tap untuk scan QR</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-white/70 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>
      </div>

      <AnimatePresence>
        {isIzinModalOpen && (
          <IzinModal 
            isOpen={isIzinModalOpen} 
            onClose={() => setIsIzinModalOpen(false)} 
            onSuccess={handleIzinSuccess} 
          />
        )}
      </AnimatePresence>
    </>
  );
}
