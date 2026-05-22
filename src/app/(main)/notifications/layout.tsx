import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'Notifikasi',
};

export default function NotificationsLayout({ children }: { children: React.ReactNode }) {
  return <AppShell headerTitle="Notifikasi">{children}</AppShell>;
}
