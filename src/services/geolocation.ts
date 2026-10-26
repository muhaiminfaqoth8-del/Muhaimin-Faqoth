/**
 * Geolocation & Geofencing Service for Klinik Sidogiri
 * Coordinates: Jl. Asrama Putra Ponpes Sidogiri, Kraton, Pasuruan (-7.669812, 112.859640)
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface GeofenceResult {
  isInside: boolean;
  distanceMeter: number;
  maxRadiusMeter: number;
  userCoords: Coordinates;
  clinicCoords: Coordinates;
  message: string;
}

export type LocationSimulationMode = 'GPS_RIIL' | 'DI_KLINIK' | 'DI_LUAR_KLINIK';

export const KLINIK_SIDOGIRI_COORDS: Coordinates = {
  latitude: -7.669812,
  longitude: 112.859640,
};

export const DEFAULT_GEOFENCE_RADIUS_METERS = 250;

/**
 * Calculates distance between two GPS coordinates in meters using the Haversine formula.
 */
export function calculateDistanceMeters(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371000; // Radius of the Earth in meters
  const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const dLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.latitude * Math.PI) / 180) *
      Math.cos((coord2.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Evaluates whether user is inside the Klinik Sidogiri geofence.
 */
export function evaluateGeofence(
  userCoords: Coordinates,
  clinicCoords: Coordinates = KLINIK_SIDOGIRI_COORDS,
  radiusMeters: number = DEFAULT_GEOFENCE_RADIUS_METERS
): GeofenceResult {
  const distance = calculateDistanceMeters(userCoords, clinicCoords);
  const isInside = distance <= radiusMeters;

  return {
    isInside,
    distanceMeter: distance,
    maxRadiusMeter: radiusMeters,
    userCoords,
    clinicCoords,
    message: isInside
      ? `Terverifikasi di Area Klinik Sidogiri (Jarak: ${distance} m dari pos induk, maks ${radiusMeters} m)`
      : `Di Luar Area Klinik Sidogiri (Jarak: ${distance} m, melebihi batas radius ${radiusMeters} m). Absensi ditolak.`,
  };
}

/**
 * Retrieves real device GPS position or simulated coordinate.
 */
export async function getStaffLocation(
  simulationMode: LocationSimulationMode = 'GPS_RIIL'
): Promise<{ coords: Coordinates; isSimulated: boolean; error?: string }> {
  if (simulationMode === 'DI_KLINIK') {
    // 25 meters from clinic center (inside radius)
    return {
      coords: {
        latitude: KLINIK_SIDOGIRI_COORDS.latitude + 0.00015,
        longitude: KLINIK_SIDOGIRI_COORDS.longitude + 0.0001,
      },
      isSimulated: true,
    };
  }

  if (simulationMode === 'DI_LUAR_KLINIK') {
    // 1,850 meters away from clinic (outside radius)
    return {
      coords: {
        latitude: KLINIK_SIDOGIRI_COORDS.latitude + 0.015,
        longitude: KLINIK_SIDOGIRI_COORDS.longitude + 0.012,
      },
      isSimulated: true,
    };
  }

  // Real GPS lookup
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({
        coords: KLINIK_SIDOGIRI_COORDS,
        isSimulated: true,
        error: 'Browser tidak mendukung GPS Geolocation.',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          isSimulated: false,
        });
      },
      (err) => {
        // Fallback gracefully to clinic coords with note if user denies GPS permission
        resolve({
          coords: KLINIK_SIDOGIRI_COORDS,
          isSimulated: true,
          error: `Izin GPS tidak diberikan (${err.message}). Menggunakan simulasi lokasi klinik.`,
        });
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  });
}
