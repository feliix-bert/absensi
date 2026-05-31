'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/features/auth/store/authStore';
import { calculateDistance } from '@/features/attendance/utils/geo.utils';

export function SidebarLocationStatus({ collapsed }: { collapsed: boolean }) {
  const profile = useAuthStore((state) => state.profile);
  const [distance, setDistance] = useState<number | null>(null);

  useEffect(() => {
    const office = Array.isArray(profile?.offices) ? profile?.offices[0] : profile?.offices;
    if (navigator.geolocation && office?.latitude && office?.longitude) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          if (pos.coords.accuracy > 100) {
            setDistance(-1);
          } else {
            const dist = calculateDistance(pos.coords.latitude, pos.coords.longitude, office.latitude, office.longitude);
            setDistance(Math.round(dist));
          }
        },
        () => {
          setDistance(null);
        },
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [profile]);

  if (collapsed) return null;

  const office = Array.isArray(profile?.offices) ? profile?.offices[0] : profile?.offices;
  const radius = office?.radius || 150;
  const isInside = distance !== null && distance !== -1 && distance <= radius;
  const isLowAccuracy = distance === -1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn("mx-3 mb-3 p-3 rounded-lg border", 
        distance === null ? "bg-neutral-50 border-neutral-100" :
        isLowAccuracy ? "bg-warning-50 border-warning-100" :
        isInside ? "bg-success-50 border-success-100" : "bg-danger-50 border-danger-100"
      )}
    >
      <div className="flex items-center gap-2">
        <MapPin size={14} className={cn("flex-shrink-0", 
           distance === null ? "text-neutral-400" :
           isLowAccuracy ? "text-warning-600" :
           isInside ? "text-success-600" : "text-danger-600"
        )} />
        <div className="min-w-0">
          <p className={cn("text-[11px] font-medium truncate",
             distance === null ? "text-neutral-500" :
             isLowAccuracy ? "text-warning-700" :
             isInside ? "text-success-700" : "text-danger-700"
          )}>
            {distance === null ? 'Finding location...' :
             isLowAccuracy ? 'Low GPS accuracy' :
             isInside ? 'Inside radius' : 'Outside area'
            }
          </p>
          {distance !== null && !isLowAccuracy && (
            <p className={cn("text-[10px] truncate", 
              isInside ? "text-success-600" : "text-danger-600"
            )}>
              ± {distance} m from office
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
