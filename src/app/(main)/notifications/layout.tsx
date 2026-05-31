import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'Notifications',
};

export default function NotificationsLayout({ children }: { children: React.ReactNode }) {
  return <AppShell headerTitle="Notifications">{children}</AppShell>;
}
