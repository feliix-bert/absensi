import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = { title: 'Attendance History' };

export default function HistoryLayout({ children }: { children: React.ReactNode }) {
  return <AppShell headerTitle="Attendance History" showSearch>{children}</AppShell>;
}
