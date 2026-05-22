// ─────────────────────────────────────────────
// TelIntern Constants
// ─────────────────────────────────────────────

export const APP_NAME = 'TelIntern';
export const APP_TAGLINE = 'Smart Internship Attendance';
export const APP_VERSION = '1.0.0';

// Office location mock (Telkom Indonesia HQ - Jakarta)
export const MOCK_OFFICE = {
  name: 'Telkom Indonesia — Gedung Graha Merah Putih',
  address: 'Jl. Jenderal Gatot Subroto No.Kav. 52, Jakarta Selatan',
  latitude: -6.229690,
  longitude: 106.820860,
  radius: 150, // meters
};

// Attendance timing rules
export const ATTENDANCE_RULES = {
  checkInStart: '07:00',
  checkInEnd: '09:00',
  lateThreshold: '08:00',   // after this = late
  checkOutStart: '16:00',
  checkOutEnd: '18:00',
  workingDays: [1, 2, 3, 4, 5], // Mon-Fri (0=Sun, 6=Sat)
};

// Divisions list
export const DIVISIONS = [
  'Digital & IT',
  'Customer Experience',
  'Human Capital',
  'Finance & Strategy',
  'Network & Infrastructure',
  'Marketing & Communication',
  'Legal & Compliance',
  'Enterprise Business',
  'Consumer Business',
  'Wholesale & International',
];

// Routes
export const ROUTES = {
  home: '/',
  login: '/login',
  signup: '/signup',
  dashboard: '/dashboard',
  scan: '/scan',
  history: '/history',
  profile: '/profile',
  location: '/location',
  notifications: '/notifications',
};

// Status labels in Indonesian
export const STATUS_LABELS: Record<string, string> = {
  hadir: 'Hadir',
  terlambat: 'Terlambat',
  izin: 'Izin',
  alpha: 'Alpha',
  libur: 'Libur',
};

// Status colors mapping
export const STATUS_COLORS: Record<string, string> = {
  hadir: 'success',
  terlambat: 'warning',
  izin: 'primary',
  alpha: 'danger',
  libur: 'neutral',
};
