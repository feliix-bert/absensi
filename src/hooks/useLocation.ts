'use client';

import { useCallback, useState } from 'react';
import { MOCK_OFFICE } from '@/lib/constants';
import type { LocationData, LocationStatus } from '@/lib/types';

const INITIAL: LocationData = {
  status: 'idle',
  latitude: null,
  longitude: null,
  accuracy: null,
  distance: null,
  officeRadius: MOCK_OFFICE.radius,
  officeName: MOCK_OFFICE.name,
  officeLatitude: MOCK_OFFICE.latitude,
  officeLongitude: MOCK_OFFICE.longitude,
};

/** Mock location hook — simulates GPS permission & radius check */
export function useLocation() {
  const [data, setData] = useState<LocationData>(INITIAL);

  const requestPermission = useCallback(async () => {
    setData((d) => ({ ...d, status: 'requesting' }));
    await delay(800);
    setData((d) => ({ ...d, status: 'loading' }));
    await delay(1500);
    // Mock: inside radius
    setData((d) => ({
      ...d,
      status: 'inside',
      latitude: MOCK_OFFICE.latitude + 0.0001,
      longitude: MOCK_OFFICE.longitude + 0.0001,
      accuracy: 10,
      distance: 45,
    }));
  }, []);

  const setDemoState = useCallback((status: LocationStatus, overrides?: Partial<LocationData>) => {
    const presets: Partial<Record<LocationStatus, Partial<LocationData>>> = {
      inside: { distance: 45, accuracy: 10 },
      outside: { distance: 430, accuracy: 25 },
      low_accuracy: { distance: 120, accuracy: 85 },
      denied: { distance: null, accuracy: null },
    };

    setData((d) => ({
      ...d,
      status,
      ...presets[status],
      ...overrides,
    }));
  }, []);

  const refresh = useCallback(async () => {
    setData((d) => ({ ...d, status: 'loading' }));
    await delay(1200);
    setData((d) => ({ ...d, status: 'inside', distance: 45, accuracy: 10 }));
  }, []);

  const canScan = data.status === 'inside';

  return { data, requestPermission, setDemoState, refresh, canScan };
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
