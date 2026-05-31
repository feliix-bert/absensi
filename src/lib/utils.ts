import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { AttendanceStatus } from './types';

// ─────────────────────────────────────────────
// Tailwind class merge utility
// ─────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─────────────────────────────────────────────
// Date & Time Utilities
// ─────────────────────────────────────────────
export function formatDate(dateStr: string, opts?: Intl.DateTimeFormatOptions): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...opts,
  });
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatTime(timeStr: string): string {
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12.toString().padStart(2, '0')}:${m} ${ampm}`;
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 11) return 'Good Morning';
  if (hour < 15) return 'Good Afternoon';
  if (hour < 18) return 'Good Evening';
  return 'Good Night';
}

export function getDayName(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long' });
}

export function getMonthYear(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function calculateDuration(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getInternshipProgress(startDate: string, endDate: string): number {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (now < start) return 0;
  if (now > end) return 100;
  const total = end.getTime() - start.getTime();
  const elapsed = now.getTime() - start.getTime();
  return Math.round((elapsed / total) * 100);
}

export function getRemainingDays(endDate: string): number {
  const now = new Date();
  const end = new Date(endDate);
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

// ─────────────────────────────────────────────
// Location Utilities
// ─────────────────────────────────────────────
export function calculateDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

// ─────────────────────────────────────────────
// Status Utilities
// ─────────────────────────────────────────────
export function getStatusBadgeClass(status: AttendanceStatus): string {
  const map: Record<AttendanceStatus, string> = {
    hadir: 'badge-success',
    terlambat: 'badge-warning',
    izin: 'badge-primary',
    alpha: 'badge-danger',
    libur: 'badge-neutral',
  };
  return map[status] ?? 'badge-neutral';
}

export function getStatusLabel(status: AttendanceStatus): string {
  const map: Record<AttendanceStatus, string> = {
    hadir: 'Present',
    terlambat: 'Late',
    izin: 'Excused',
    alpha: 'Absent',
    libur: 'Holiday',
  };
  return map[status] ?? status;
}

// ─────────────────────────────────────────────
// String Utilities
// ─────────────────────────────────────────────
export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('');
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 1) + '…';
}

export function formatNIM(nim: string): string {
  // e.g. "1234567890" → "1234-5678-90"
  return nim.replace(/(\d{4})(\d{4})(\d+)/, '$1-$2-$3');
}
