import type { Coordinates } from '../types';

export type GeoResult =
  | { ok: true; coords: Coordinates }
  | { ok: false; message: string; code?: number };

function mapError(err: GeolocationPositionError): string {
  switch (err.code) {
    case err.PERMISSION_DENIED:
      return 'Location permission was denied. Allow location access in your browser settings, or choose a place manually.';
    case err.POSITION_UNAVAILABLE:
      return 'Location is unavailable right now. Check that Location Services are on, then try again.';
    case err.TIMEOUT:
      return 'Location request timed out. Try again, or choose a coastal area below.';
    default:
      return 'Could not read your location. Choose a coastal area below.';
  }
}

function requestPosition(options: PositionOptions): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

/** Robust current-location helper with high-accuracy fallback */
export async function getCurrentCoordinates(): Promise<GeoResult> {
  if (typeof window === 'undefined' || !('geolocation' in navigator)) {
    return {
      ok: false,
      message: 'Geolocation is not supported in this browser. Choose a location manually.',
    };
  }

  // Browsers block geolocation on insecure origins (except localhost)
  if (!window.isSecureContext) {
    return {
      ok: false,
      message:
        'Location needs a secure context (https or localhost). Open the app via localhost, or choose a place manually.',
    };
  }

  try {
    if (navigator.permissions?.query) {
      const status = await navigator.permissions.query({ name: 'geolocation' });
      if (status.state === 'denied') {
        return {
          ok: false,
          code: 1,
          message:
            'Location permission is blocked. Click the lock/info icon in the address bar → Site settings → Location → Allow, then try again.',
        };
      }
    }
  } catch {
    // permissions API optional
  }

  try {
    const pos = await requestPosition({
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 60000,
    });
    return {
      ok: true,
      coords: { lat: pos.coords.latitude, lng: pos.coords.longitude },
    };
  } catch (first) {
    try {
      const pos = await requestPosition({
        enableHighAccuracy: false,
        timeout: 20000,
        maximumAge: 300000,
      });
      return {
        ok: true,
        coords: { lat: pos.coords.latitude, lng: pos.coords.longitude },
      };
    } catch (second) {
      const err = (second ?? first) as GeolocationPositionError;
      return { ok: false, code: err.code, message: mapError(err) };
    }
  }
}
