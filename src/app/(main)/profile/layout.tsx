import type { Metadata } from 'next';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = { title: 'Profil Saya' };

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <AppShell headerTitle="Profil Saya">{children}</AppShell>;
}
