import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'Home',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
