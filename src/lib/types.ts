// ─────────────────────────────────────────────
// TelIntern Type Definitions
// ─────────────────────────────────────────────

export type UserRole = 'intern' | 'admin' | 'mentor';

export type AttendanceStatus = 'hadir' | 'terlambat' | 'izin' | 'alpha' | 'libur';

export type LocationStatus =
  | 'idle'
  | 'requesting'
  | 'loading'
  | 'inside'
  | 'outside'
  | 'low_accuracy'
  | 'denied';

export type ScanResult = 'idle' | 'scanning' | 'success' | 'invalid' | 'expired';

// ─── User ───────────────────────────────────
export interface User {
  id: string;
  name: string;
  nim: string;           // NIM / NIS / ID Magang
  mentor: string;
  startDate: string;     // ISO date string
  endDate: string;       // ISO date string
  officeLocation: string;
  officeAddress: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  createdAt: string;
}

// ─── Attendance ──────────────────────────────
export interface AttendanceRecord {
  id: string;
  date: string;          // ISO date string e.g. "2025-05-21"
  checkIn: string | null;  // e.g. "08:02"
  checkOut: string | null; // e.g. "17:05"
  status: AttendanceStatus;
  location: string;
  isLate: boolean;
  duration: string | null; // e.g. "8j 23m"
  notes?: string;
}

// ─── Location ────────────────────────────────
export interface LocationData {
  status: LocationStatus;
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;  // meters
  distance: number | null;  // meters from office
  officeRadius: number;     // meters (e.g. 100)
  officeName: string;
  officeLatitude: number;
  officeLongitude: number;
}

// ─── Dashboard Stats ─────────────────────────
export interface DashboardStats {
  totalDays: number;
  attendedDays: number;
  lateDays: number;
  izinDays: number;
  alphaDays: number;
  streakDays: number;
  remainingDays: number;
  attendanceRate: number; // percentage 0-100
  internshipProgress: number; // percentage 0-100
}

// ─── Today Attendance ────────────────────────
export interface TodayAttendance {
  hasCheckedIn: boolean;
  hasCheckedOut: boolean;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: AttendanceStatus | null;
  date: string;
}

// ─── Notification ────────────────────────────
export interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
}

// ─── Nav Item ────────────────────────────────
export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  badge?: number;
}

// ─── Form State ──────────────────────────────
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface SignupStep1Data {
  name: string;
  nim: string;
  mentor: string;
}

export interface SignupStep2Data {
  startDate: string;
  endDate: string;
  officeLocation: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export type SignupFormData = SignupStep1Data & SignupStep2Data;
