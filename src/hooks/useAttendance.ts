'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  MOCK_ATTENDANCE_HISTORY,
  MOCK_STATS,
  MOCK_TODAY,
} from '@/lib/mock-data';
import type { AttendanceRecord, AttendanceStatus, ScanResult } from '@/lib/types';

export function useAttendance() {
  const [today, setToday] = useState(MOCK_TODAY);
  const [history] = useState(MOCK_ATTENDANCE_HISTORY);
  const [scanState, setScanState] = useState<ScanResult>('scanning');

  const stats = MOCK_STATS;

  const filterByStatus = useCallback(
    (status: AttendanceStatus | 'semua') => {
      if (status === 'semua') return history;
      return history.filter((r) => r.status === status);
    },
    [history]
  );

  const filterByMonth = useCallback(
    (yearMonth: string) => {
      return history.filter((r) => r.date.startsWith(yearMonth));
    },
    [history]
  );

  const availableMonths = useMemo(() => {
    const months = new Set(history.map((r) => r.date.slice(0, 7)));
    return Array.from(months).sort().reverse();
  }, [history]);

  const simulateScan = useCallback(async (result: ScanResult = 'success') => {
    setScanState('scanning');
    await new Promise((r) => setTimeout(r, 1500));
    setScanState(result);
    if (result === 'success' && !today.hasCheckedIn) {
      const now = new Date();
      const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      setToday({
        ...today,
        hasCheckedIn: true,
        checkInTime: time,
        status: 'hadir',
      });
    }
  }, [today]);

  const resetScan = useCallback(() => setScanState('scanning'), []);

  return {
    today,
    history,
    stats,
    scanState,
    filterByStatus,
    filterByMonth,
    availableMonths,
    simulateScan,
    resetScan,
    setScanState,
  };
}
