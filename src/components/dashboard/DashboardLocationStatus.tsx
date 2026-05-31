'use client';

import { useState, useEffect } from 'react';
import { MapPin, CheckCircle2, XCircle } from 'lucide-react';
import { calculateDistance } from '@/features/attendance/utils/geo.utils';

export function DashboardLocationStatus({ office }: { office: any }) {
  const [distance, setDistance] = useState<number | null>(null);

  useEffect(() => {
    if (navigator.geolocation && office?.latitude && office?.longitude) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const dist = calculateDistance(pos.coords.latitude, pos.coords.longitude, office.latitude, office.longitude);
          setDistance(Math.round(dist));
        },
        () => {
          setDistance(null);
        },
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [office]);

  const radius = office?.radius || 150;
  const isInside = distance !== null && distance <= radius;

  return (
    <div className="pt-3 border-t border-neutral-100 mt-auto">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-neutral-500">Your Status</span>
        {distance === null ? (
          <span className="text-xs font-semibold text-neutral-400">Waiting for Location...</span>
        ) : isInside ? (
          <span className="text-xs font-semibold text-success-600 flex items-center gap-1">
            <CheckCircle2 size={12} /> Inside Radius (±{distance}m)
          </span>
        ) : (
          <span className="text-xs font-semibold text-danger-600 flex items-center gap-1">
            <XCircle size={12} /> Outside Radius (±{distance}m)
          </span>
        )}
      </div>
    </div>
  );
}
