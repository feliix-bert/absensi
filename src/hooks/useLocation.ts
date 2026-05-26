'use client';

import { useCallback, useState } from 'react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { calculateDistance, getHighAccuracyLocation } from '@/features/attendance/utils/geo.utils';
import type { LocationData, LocationStatus } from '@/lib/types';

export function useLocation() {
  const profile = useAuthStore(state => state.profile);
  const office = Array.isArray(profile?.offices) ? profile?.offices[0] : profile?.offices;

  const [data, setData] = useState<LocationData>({
    status: 'idle',
    latitude: null,
    longitude: null,
    accuracy: null,
    distance: null,
    officeRadius: office?.radius || 150,
    officeName: office?.nama || 'Kantor',
    officeLatitude: office?.latitude || 0,
    officeLongitude: office?.longitude || 0,
  });

  const updateLocation = useCallback(() => {
    return new Promise<void>((resolve) => {
      if (!navigator.geolocation) {
        setData(d => ({ ...d, status: 'denied' }));
        resolve();
        return;
      }

      getHighAccuracyLocation({ timeoutMs: 12000, desiredAccuracy: 40 })
        .then((loc) => {
          if (!office || !office.latitude || !office.longitude) {
             // Fallback if no office assigned
             setData(d => ({ ...d, status: 'outside', latitude: loc.lat, longitude: loc.lng, accuracy: loc.acc, distance: null }));
             resolve();
             return;
          }

          if (loc.acc > 100) {
            setData(d => ({
              ...d,
              status: 'low_accuracy',
              latitude: loc.lat,
              longitude: loc.lng,
              accuracy: loc.acc,
              distance: null,
            }));
            resolve();
            return;
          }

          const dist = calculateDistance(loc.lat, loc.lng, office.latitude, office.longitude);
          setData(d => ({
            ...d,
            status: dist <= (office.radius || 150) ? 'inside' : 'outside',
            latitude: loc.lat,
            longitude: loc.lng,
            accuracy: loc.acc,
            distance: Math.round(dist),
            officeRadius: office.radius,
            officeName: office.nama,
            officeLatitude: office.latitude,
            officeLongitude: office.longitude,
          }));
          resolve();
        })
        .catch(() => {
          setData(d => ({ ...d, status: 'denied' }));
          resolve();
        });
    });
  }, [office]);

  const requestPermission = useCallback(async () => {
    setData((d) => ({ ...d, status: 'requesting' }));
    await updateLocation();
  }, [updateLocation]);

  const refresh = useCallback(async () => {
    setData((d) => ({ ...d, status: 'loading' }));
    await updateLocation();
  }, [updateLocation]);

  // Keep setDemoState for development testing if needed, or make it a no-op
  const setDemoState = useCallback((status: LocationStatus, overrides?: Partial<LocationData>) => {
    setData((d) => ({ ...d, status, ...overrides }));
  }, []);

  const canScan = data.status === 'inside';

  return { data, requestPermission, setDemoState, refresh, canScan };
}
