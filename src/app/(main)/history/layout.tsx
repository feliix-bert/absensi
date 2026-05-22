import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = { title: 'Riwayat Absensi' };

export default function HistoryLayout({ children }: { children: React.ReactNode }) {
  return <AppShell headerTitle="Riwayat Absensi" showSearch>{children}</AppShell>;
}
