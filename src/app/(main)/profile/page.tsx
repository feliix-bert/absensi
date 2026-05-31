'use client';

import { useState, useActionState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User, Hash, GraduationCap, Calendar,
  MapPin, Mail, LogOut, ChevronRight, Edit3,
  ShieldCheck, Bell, X, Check
} from 'lucide-react';
import {
  getInitials, formatDateShort, getInternshipProgress, getRemainingDays, cn
} from '@/lib/utils';
import { useAuthStore } from '@/features/auth/store/authStore';
import { updateProfile } from '@/actions/auth.actions';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

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

function ProfileSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-10 animate-pulse">
      <div className="rounded-2xl bg-secondary-700 p-6 h-48" />
      <div className="card p-5 h-24" />
      <div className="card p-5 h-64" />
    </div>
  );
}

export default function ProfilePage() {
  const storeProfile = useAuthStore((state) => state.profile);
  const storeUser = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);

  // Local state for direct-fetch fallback
  const [localProfile, setLocalProfile] = useState<any>(null);
  const [localUser, setLocalUser] = useState<any>(null);
  const [isFetching, setIsFetching] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const router = useRouter();
  
  const [state, formAction, isPending] = useActionState(updateProfile, null);

  // Fallback: if store is done loading but profile is still null, fetch directly
  useEffect(() => {
    if (!isLoading && !storeProfile && !isFetching) {
      setIsFetching(true);
      const supabase = createClient();
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (!user) { setIsFetching(false); return; }
        setLocalUser(user);
        supabase
          .from('profiles')
          .select('*, offices(nama, radius, latitude, longitude)')
          .eq('id', user.id)
          .single()
          .then(({ data }) => {
            if (data) {
              setLocalProfile(data);
              // Also hydrate the store so subsequent navigations are fast
              useAuthStore.getState().setProfile(data);
              useAuthStore.getState().setUser(user);
            }
            setIsFetching(false);
          });
      });
    }
  }, [isLoading, storeProfile, isFetching]);

  useEffect(() => {
    if (state?.success) {
      setIsEditing(false);
      useAuthStore.getState().refreshProfile();
    }
  }, [state]);

  // Use store data first, fall back to directly fetched data
  const profile = storeProfile || localProfile;
  const user = storeUser || localUser;

  // Show skeleton while store is initializing OR while doing fallback fetch
  if (isLoading || isFetching || !profile || !user) {
    return <ProfileSkeleton />;
  }

  const startDate = profile.mulai_magang || new Date().toISOString();
  const endDate = profile.selesai_magang || new Date().toISOString();
  
  const progress = getInternshipProgress(startDate, endDate);
  const remaining = getRemainingDays(endDate);

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-10">
      
      {/* ─── Profile Card ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl bg-secondary-700 text-white p-6 relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 w-32 h-full opacity-5 pointer-events-none">
          <div className="absolute right-4 top-4 w-20 h-20 rounded-full border border-white" />
          <div className="absolute right-0 bottom-0 w-28 h-28 rounded-full border border-white" />
        </div>

        <div className="relative flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-primary-600/30 border-2 border-primary-500/40 flex items-center justify-center text-white text-2xl font-bold">
              {getInitials(profile.nama)}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-success-500 border-2 border-secondary-700 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-white leading-tight">{profile.nama}</h2>
            <p className="text-secondary-300 text-body-sm mt-0.5">{profile.nim}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="badge bg-success-600/20 text-success-400 text-xs">Active</span>
            </div>
          </div>

          <button 
            onClick={() => setIsEditing(!isEditing)}
            aria-label={isEditing ? 'Cancel Edit Profile' : 'Edit Profile'}
            className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors flex-shrink-0"
          >
            {isEditing ? <X size={15} className="text-white" /> : <Edit3 size={15} className="text-white" />}
          </button>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-white/10">
          <div className="text-center">
            <p className="text-lg font-bold text-white">{remaining}</p>
            <p className="text-[11px] text-secondary-400">Days Left</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-white">{progress}%</p>
            <p className="text-[11px] text-secondary-400">Progress</p>
          </div>
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
          <span className="text-label-lg text-neutral-700">Internship Duration</span>
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
          <span>Start: {formatDateShort(startDate)}</span>
          <span>End: {formatDateShort(endDate)}</span>
        </div>
      </motion.div>

      {/* ─── Personal Info ─── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.12 }}
        className="card px-5"
      >
        <h3 className="text-label-sm text-neutral-400 uppercase tracking-wide py-3 border-b border-neutral-100 flex justify-between items-center">
          Internship Information
          {isEditing && <span className="text-primary-600 font-bold">Edit Mode</span>}
        </h3>

        {isEditing ? (
          <form action={formAction} className="py-4 space-y-4">
            {state?.error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium">
                {state.error}
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-500 uppercase">Full Name</label>
              <input name="nama" defaultValue={profile.nama} className="w-full px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500" required />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-500 uppercase">NIM / Intern ID</label>
              <input name="nim" defaultValue={profile.nim} className="w-full px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500" required />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-500 uppercase">Mentor</label>
              <input name="pembimbing" defaultValue={profile.pembimbing} className="w-full px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500" required />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-500 uppercase">Start Date</label>
                <input type="date" name="mulai_magang" defaultValue={startDate.split('T')[0]} className="w-full px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-500 uppercase">End Date</label>
                <input type="date" name="selesai_magang" defaultValue={endDate.split('T')[0]} className="w-full px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500" required />
              </div>
            </div>

            <button type="submit" disabled={isPending} className="w-full py-2.5 mt-4 bg-primary-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-primary-700 transition disabled:opacity-50">
              <Check size={18} /> {isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        ) : (
          <>
            <InfoRow icon={User} label="Full Name" value={profile.nama} />
            <InfoRow icon={Hash} label="NIM / Intern ID" value={profile.nim} />
            <InfoRow icon={GraduationCap} label="Mentor" value={profile.pembimbing} />
            <InfoRow
              icon={Calendar}
              label="Internship Period"
              value={`${formatDateShort(startDate)} — ${formatDateShort(endDate)}`}
            />
            <InfoRow icon={MapPin} label="Office Location" value={profile.offices?.nama || '-'} />
            <InfoRow icon={Mail} label="Email" value={user.email || ''} />
          </>
        )}
      </motion.div>

      {/* ─── Settings Options ─── */}
      {!isEditing && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.16 }}
          className="card divide-y divide-neutral-100"
        >
          {[
            { icon: Bell, label: 'Notifications', desc: 'Notification settings', action: () => router.push('/notifications') },
            { icon: ShieldCheck, label: 'Security', desc: 'Change password', action: () => setIsPasswordModalOpen(true) },
          ].map((item) => (
            <button
              key={item.label}
              onClick={item.action}
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
      )}

      {/* ─── Logout ─── */}
      {!isEditing && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="btn btn-danger btn-full btn-lg w-full"
          >
            <LogOut size={18} /> Logout
          </button>
        </motion.div>
      )}

      {/* ─── Logout Confirm Modal ─── */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
          >
            <h3 className="text-xl font-bold text-neutral-900 mb-2">Logout</h3>
            <p className="text-sm text-neutral-500 mb-6">Are you sure you want to log out of TelIntern?</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 font-semibold hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  const supabase = createClient();
                  await supabase.auth.signOut();
                  router.push('/login');
                }} 
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600"
              >
                Yes, Logout
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ─── Password Change Modal ─── */}
      {isPasswordModalOpen && (
        <PasswordChangeModal onClose={() => setIsPasswordModalOpen(false)} />
      )}

      {/* ─── Version ─── */}
      <p className="text-center text-body-sm text-neutral-300 pb-2">
        TelIntern v1.0.0 · © 2026 Telkom Indonesia
      </p>
    </div>
  );
}

function PasswordChangeModal({ onClose }: { onClose: () => void }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    
    setLoading(false);
    if (err) {
      setError(err.message);
    } else {
      setSuccess(true);
      setTimeout(onClose, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
      >
        <h3 className="text-xl font-bold text-neutral-900 mb-4">Change Password</h3>
        
        {success ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Check className="text-success-600" />
            </div>
            <p className="text-success-700 font-medium">Password changed successfully!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-danger-600 text-sm font-medium">{error}</p>}
            <div>
              <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">New Password</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500" 
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">Confirm New Password</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500" 
                required 
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 py-2 rounded-xl text-neutral-600 font-medium hover:bg-neutral-100"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="flex-1 py-2 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
