'use client';

import Link from 'next/link';
import { Briefcase, GraduationCap, MapPin, ChevronRight } from 'lucide-react';
import { Avatar } from '@/components/shared/Avatar';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useState, useEffect } from 'react';

export function ProfileSummary() {
  const profile = useAuthStore(state => state.profile);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !profile) return null;

  return (
    <aside className="hidden lg:block">
      <div className="card-modern p-5 sticky top-24">
        <div className="flex items-center gap-3 pb-4 border-b border-neutral-100">
          <Avatar name={profile.nama} size="lg" />
          <div className="min-w-0">
            <p className="font-bold text-neutral-900 truncate">{profile.nama}</p>
            <p className="text-xs text-neutral-500">{profile.nim}</p>
          </div>
        </div>

        <dl className="space-y-4 pt-4">
          {[
            { icon: Briefcase, label: 'Divisi', value: profile.divisi },
            { icon: GraduationCap, label: 'Pembimbing', value: profile.pembimbing },
            { icon: MapPin, label: 'Kantor', value: profile.offices?.nama || '-' },
          ].map((row) => (
            <div key={row.label} className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center shrink-0">
                <row.icon size={14} className="text-neutral-500" />
              </div>
              <div className="min-w-0">
                <dt className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide">
                  {row.label}
                </dt>
                <dd className="text-sm font-medium text-neutral-800 mt-0.5 leading-snug">
                  {row.value}
                </dd>
              </div>
            </div>
          ))}
        </dl>

        <Link
          href="/profile"
          className="mt-5 flex items-center justify-center gap-1 w-full py-2.5 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
        >
          Profil lengkap <ChevronRight size={14} />
        </Link>
      </div>
    </aside>
  );
}
