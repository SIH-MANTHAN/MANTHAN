import type { StyleSpecification } from 'maplibre-gl';

/** MapLibre + free OSM-derived tiles — no API key / Google billing */

export const DEFAULT_MAP_CENTER = { lat: 18.9207, lng: 72.8305 };
export const DEFAULT_MAP_ZOOM = 9;

/** Public OSRM demo server for driving geometry (no API key) */
export const OSRM_ROUTER_URL = 'https://router.project-osrm.org';

import landData from '../data/real/indian_ocean_land.json';

/**
 * Keyless, free basemap. Two stacked pieces:
 *  1. An OFFLINE base bundled with the app (Natural Earth land polygons for the
 *     Indian Ocean region, public domain) — always renders, needs no network.
 *  2. Optional OpenStreetMap raster tiles on top (free, no API key) for street
 *     and place detail when the network allows.
 * If tiles never arrive, the offline base is still a real, pannable, zoomable
 * chart of the coast — never a blank box.
 */
export function buildMapStyle(night: boolean, withTiles: boolean): StyleSpecification {
  const ocean = night ? '#0b2a3c' : '#bcd9e6';
  const land = night ? '#1f3f4d' : '#efe6d2';
  const coast = night ? '#3f7185' : '#b9a67a';
  const style: StyleSpecification = {
    version: 8,
    name: night ? 'manthan-night' : 'manthan-day',
    sources: {
      land: { type: 'geojson', data: landData as unknown as GeoJSON.FeatureCollection },
      ...(withTiles
        ? {
            osm: {
              type: 'raster' as const,
              tiles: [
                'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
              ],
              tileSize: 256,
              maxzoom: 19,
              attribution: '© OpenStreetMap contributors',
            },
          }
        : {}),
    },
    layers: [
      { id: 'ocean-bg', type: 'background', paint: { 'background-color': ocean } },
      { id: 'land-fill', type: 'fill', source: 'land', paint: { 'fill-color': land } },
      { id: 'land-coast', type: 'line', source: 'land', paint: { 'line-color': coast, 'line-width': 1 } },
      ...(withTiles
        ? [
            {
              id: 'osm-tiles',
              type: 'raster' as const,
              source: 'osm',
              paint: night
                ? { 'raster-brightness-max': 0.42, 'raster-saturation': -0.4, 'raster-contrast': 0.15 }
                : {},
            },
          ]
        : []),
    ],
  };
  return style;
}
