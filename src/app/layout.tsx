import type { Metadata, Viewport } from 'next';
import { AuthProvider } from '@/components/providers/AuthProvider';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'TelIntern — Smart Internship Attendance',
    template: '%s | TelIntern',
  },
  description:
    'Platform absensi magang berbasis lokasi dan QR Code untuk peserta magang Telkom Indonesia. Smart, cepat, dan akurat.',
  keywords: ['absensi magang', 'TelIntern', 'Telkom Indonesia', 'attendance system', 'internship'],
  authors: [{ name: 'Telkom Indonesia' }],
  openGraph: {
    title: 'TelIntern — Smart Internship Attendance',
    description: 'Platform absensi magang berbasis lokasi dan QR Code.',
    type: 'website',
    locale: 'id_ID',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  themeColor: '#0E2A47',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-neutral-50 min-h-dvh">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
