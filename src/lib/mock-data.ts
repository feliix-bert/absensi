import type { User, AttendanceRecord, DashboardStats, TodayAttendance, Notification } from './types';

// ─────────────────────────────────────────────
// Mock Current User
// ─────────────────────────────────────────────
export const MOCK_USER: User = {
  id: 'intern-001',
  name: 'Yohana Putri Maharani',
  nim: '1301213456',
  mentor: 'Bpk. Reza Firmansyah, S.T., M.Kom.',
  startDate: '2025-03-01',
  endDate: '2025-08-31',
  officeLocation: 'Telkom Indonesia — Gedung Graha Merah Putih',
  officeAddress: 'Jl. Jenderal Gatot Subroto No.Kav. 52, Jakarta Selatan',
  email: 'yohana.putri@intern.telkom.co.id',
  avatarUrl: undefined,
  role: 'intern',
  createdAt: '2025-03-01T07:00:00.000Z',
};

// ─────────────────────────────────────────────
// Mock Today's Attendance
// ─────────────────────────────────────────────
export const MOCK_TODAY: TodayAttendance = {
  hasCheckedIn: true,
  hasCheckedOut: false,
  checkInTime: '07:58',
  checkOutTime: null,
  status: 'hadir',
  date: new Date().toISOString().split('T')[0],
};

// ─────────────────────────────────────────────
// Mock Attendance History
// ─────────────────────────────────────────────
export const MOCK_ATTENDANCE_HISTORY: AttendanceRecord[] = [
  {
    id: 'att-001',
    date: '2025-05-21',
    checkIn: '07:58',
    checkOut: null,
    status: 'hadir',
    location: 'Gedung Graha Merah Putih',
    isLate: false,
    duration: null,
  },
  {
    id: 'att-002',
    date: '2025-05-20',
    checkIn: '08:03',
    checkOut: '17:12',
    status: 'hadir',
    location: 'Gedung Graha Merah Putih',
    isLate: false,
    duration: '9j 9m',
  },
  {
    id: 'att-003',
    date: '2025-05-19',
    checkIn: '08:47',
    checkOut: '17:00',
    status: 'terlambat',
    location: 'Gedung Graha Merah Putih',
    isLate: true,
    duration: '8j 13m',
    notes: 'Kemacetan Jakarta Selatan',
  },
  {
    id: 'att-004',
    date: '2025-05-18',
    checkIn: null,
    checkOut: null,
    status: 'libur',
    location: '-',
    isLate: false,
    duration: null,
    notes: 'Libur Nasional — Kenaikan Isa Almasih',
  },
  {
    id: 'att-005',
    date: '2025-05-17',
    checkIn: null,
    checkOut: null,
    status: 'libur',
    location: '-',
    isLate: false,
    duration: null,
    notes: 'Libur Nasional',
  },
  {
    id: 'att-006',
    date: '2025-05-16',
    checkIn: '07:52',
    checkOut: '17:05',
    status: 'hadir',
    location: 'Gedung Graha Merah Putih',
    isLate: false,
    duration: '9j 13m',
  },
  {
    id: 'att-007',
    date: '2025-05-15',
    checkIn: '07:55',
    checkOut: '17:00',
    status: 'hadir',
    location: 'Gedung Graha Merah Putih',
    isLate: false,
    duration: '9j 5m',
  },
  {
    id: 'att-008',
    date: '2025-05-14',
    checkIn: null,
    checkOut: null,
    status: 'izin',
    location: '-',
    isLate: false,
    duration: null,
    notes: 'Sakit — ada surat dokter',
  },
  {
    id: 'att-009',
    date: '2025-05-13',
    checkIn: '08:01',
    checkOut: '17:08',
    status: 'hadir',
    location: 'Gedung Graha Merah Putih',
    isLate: false,
    duration: '9j 7m',
  },
  {
    id: 'att-010',
    date: '2025-05-12',
    checkIn: '07:59',
    checkOut: '17:02',
    status: 'hadir',
    location: 'Gedung Graha Merah Putih',
    isLate: false,
    duration: '9j 3m',
  },
  {
    id: 'att-011',
    date: '2025-05-09',
    checkIn: '08:05',
    checkOut: '17:10',
    status: 'hadir',
    location: 'Gedung Graha Merah Putih',
    isLate: false,
    duration: '9j 5m',
  },
  {
    id: 'att-012',
    date: '2025-05-08',
    checkIn: null,
    checkOut: null,
    status: 'alpha',
    location: '-',
    isLate: false,
    duration: null,
  },
];

// ─────────────────────────────────────────────
// Mock Dashboard Stats
// ─────────────────────────────────────────────
export const MOCK_STATS: DashboardStats = {
  totalDays: 83,
  attendedDays: 61,
  lateDays: 3,
  izinDays: 4,
  alphaDays: 1,
  streakDays: 5,
  remainingDays: 74,
  attendanceRate: 94,
  internshipProgress: 47,
};

// ─────────────────────────────────────────────
// Mock Notifications
// ─────────────────────────────────────────────
export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-001',
    title: 'Jangan lupa absen keluar!',
    body: 'Kamu belum melakukan absen keluar hari ini. Segera lakukan sebelum pukul 18:00.',
    type: 'warning',
    isRead: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'notif-002',
    title: 'Absensi berhasil dicatat',
    body: 'Absen masuk hari ini berhasil pada pukul 07:58. Selamat bekerja!',
    type: 'success',
    isRead: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'notif-003',
    title: 'Reminder: Evaluasi Mingguan',
    body: 'Evaluasi mingguan dengan pembimbing Bpk. Reza dijadwalkan hari Jumat pukul 15:00.',
    type: 'info',
    isRead: true,
    createdAt: '2025-05-20T10:00:00.000Z',
  },
];
