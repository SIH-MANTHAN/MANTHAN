import type { Coordinates } from '../types';
import { OSRM_ROUTER_URL } from '../config/maps';

/**
 * Detects whether this browser/device can actually create a WebGL context.
 * MapLibre GL JS (like any WebGL map library) renders nothing — no error,
 * just an empty box — when WebGL is unavailable or disabled (common in some
 * corporate browsers, older devices, remote VMs, or hardened iframes). This
 * lets MarineMap show a clear, actionable message instead of a blank chart.
 */
export function isWebglSupported(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    return Boolean(gl);
  } catch {
    return false;
  }
}

export interface DrivingRouteRequest {
  origin: Coordinates;
  destination: Coordinates;
  label?: string;
}

export interface RoutePathResult {
  coordinates: [number, number][]; // [lng, lat] for GeoJSON
  distanceM: number;
  durationS: number;
}

/** Fetch a driving path via public OSRM (no API key). Falls back to straight line. */
export async function fetchDrivingPath(
  origin: Coordinates,
  destination: Coordinates,
): Promise<RoutePathResult> {
  const url =
    `${OSRM_ROUTER_URL}/route/v1/driving/` +
    `${origin.lng},${origin.lat};${destination.lng},${destination.lat}` +
    `?overview=full&geometries=geojson`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`OSRM ${res.status}`);
    const data = (await res.json()) as {
      code?: string;
      routes?: Array<{
        distance: number;
        duration: number;
        geometry: { coordinates: [number, number][] };
      }>;
    };
    const route = data.routes?.[0];
    if (data.code === 'Ok' && route?.geometry?.coordinates?.length) {
      return {
        coordinates: route.geometry.coordinates,
        distanceM: route.distance,
        durationS: route.duration,
      };
    }
  } catch {
    // fall through to geodesic-ish straight line
  }

  return {
    coordinates: [
      [origin.lng, origin.lat],
      [destination.lng, destination.lat],
    ],
    distanceM: haversineM(origin, destination),
    durationS: 0,
  };
}

function haversineM(a: Coordinates, b: Coordinates): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Open external OSM directions (no Google dependency) */
export function openExternalDirections(destination: Coordinates, origin?: Coordinates) {
  const dest = `${destination.lat}/${destination.lng}`;
  if (origin) {
    window.open(
      `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${origin.lat}%2C${origin.lng}%3B${destination.lat}%2C${destination.lng}`,
      '_blank',
      'noopener,noreferrer',
    );
    return;
  }
  window.open(`https://www.openstreetmap.org/#map=12/${dest}`, '_blank', 'noopener,noreferrer');
}
