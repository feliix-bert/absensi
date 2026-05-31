import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = { title: 'My Profile' };

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <AppShell headerTitle="My Profile">{children}</AppShell>;
}
