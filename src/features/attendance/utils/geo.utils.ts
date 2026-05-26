/**
 * Calculates the distance between two coordinate points in meters
 * using the Haversine formula.
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // in meters
  return distance;
}

export interface HighAccuracyLocationOptions {
  timeoutMs?: number;
  desiredAccuracy?: number;
}

export interface GeolocationPoint {
  lat: number;
  lng: number;
  acc: number;
}

/**
 * Robustly requests GPS location, waiting for the GPS chip to warm up and
 * lock onto a highly accurate signal instead of returning the first coarse ping.
 */
export function getHighAccuracyLocation(
  options: HighAccuracyLocationOptions = {}
): Promise<GeolocationPoint> {
  const timeoutMs = options.timeoutMs || 10000;
  const desiredAccuracy = options.desiredAccuracy || 30;

  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(new Error('Geolocation is not supported by your browser'));
    }

    let watchId: number;
    let timeoutId: NodeJS.Timeout;
    let bestLocation: GeolocationPoint | null = null;

    const cleanup = () => {
      if (watchId !== undefined) navigator.geolocation.clearWatch(watchId);
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };

    const handleSuccess = (pos: GeolocationPosition) => {
      const current = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        acc: pos.coords.accuracy,
      };

      if (!bestLocation || current.acc < bestLocation.acc) {
        bestLocation = current;
      }

      // If we met the desired accuracy, resolve immediately
      if (current.acc <= desiredAccuracy) {
        cleanup();
        resolve(current);
      }
    };

    const handleError = (err: GeolocationPositionError) => {
      // If we fail on a ping, but already found a previous valid location, 
      // let it run till timeout just in case it recovers, but if it completely crashes, we'll see.
      // Usually, we ignore intermediate errors in watchPosition unless it's a critical permission error.
      if (err.code === err.PERMISSION_DENIED) {
        cleanup();
        reject(new Error('Izin lokasi ditolak'));
      }
    };

    watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 10000,
    });

    timeoutId = setTimeout(() => {
      cleanup();
      if (bestLocation) {
        resolve(bestLocation);
      } else {
        reject(new Error('Gagal mendapatkan lokasi akurat dalam waktu yang ditentukan (Timeout)'));
      }
    }, timeoutMs);
  });
}
