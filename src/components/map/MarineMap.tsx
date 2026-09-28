import { useEffect, useMemo, useRef, useState } from 'react';
import Map, {
  GeolocateControl,
  Layer,
  Marker,
  NavigationControl,
  Popup,
  Source,
  type MapLayerMouseEvent,
  type MapRef,
} from 'react-map-gl/maplibre';
import type { ErrorEvent, StyleSpecification } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useManthan } from '../../context/ManthanContext';
import {
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  buildMapStyle,
} from '../../config/maps';
import { fetchDrivingPath, isWebglSupported } from '../../utils/maps';
import type { Coordinates, GeofenceType, MapLayerId } from '../../types';
import { t, threatLevelLabel, alertTypeLabel } from '../../i18n/ui';
import {
  REAL_PFZ_KOCHI,
  REAL_SST_KOCHI,
  REAL_CHLOROPHYLL_KOCHI,
  REAL_KERALA_COASTLINE,
  REAL_WAVE_ADVISORY,
  REAL_DATA_META,
} from '../../data/real';
import './MarineMap.css';

function layerOn(active: Set<MapLayerId>, id: MapLayerId) {
  return active.has(id);
}

function geofenceColor(type: GeofenceType, night: boolean): string {
  if (type === 'maritime_boundary') return night ? '#D4786A' : '#B54A3C';
  if (type === 'restricted') return night ? '#D6B85A' : '#C4922A';
  if (type === 'mpa') return night ? '#82C8BF' : '#1687AD';
  if (type === 'esa') return night ? '#9D8BC9' : '#7A6AA8';
  return night ? '#82C8BF' : '#1687AD';
}

function toFeatureCollection(features: GeoJSON.Feature[]): GeoJSON.FeatureCollection {
  return { type: 'FeatureCollection', features };
}

function closeRing(ring: [number, number][]): [number, number][] {
  if (ring.length < 3) return ring;
  const [fx, fy] = ring[0];
  const [lx, ly] = ring[ring.length - 1];
  if (fx === lx && fy === ly) return ring;
  return [...ring, [fx, fy]];
}

function polygonFeature(
  id: string,
  ring: Coordinates[],
  props: Record<string, string | number | boolean>,
): GeoJSON.Feature {
  return {
    type: 'Feature',
    id,
    properties: { id, ...props },
    geometry: {
      type: 'Polygon',
      coordinates: [closeRing(ring.map((p) => [p.lng, p.lat]))],
    },
  };
}

function circlePolygon(center: Coordinates, radiusKm: number, steps = 48): Coordinates[] {
  const dLat = radiusKm / 110.574;
  const dLng = radiusKm / (111.32 * Math.cos((center.lat * Math.PI) / 180) || 1);
  const ring: Coordinates[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    ring.push({ lat: center.lat + dLat * Math.sin(t), lng: center.lng + dLng * Math.cos(t) });
  }
  return ring;
}

function windLine(center: Coordinates, speedKnots: number, directionDeg: number): GeoJSON.Feature {
  const km = Math.min(12, 4 + speedKnots * 0.25);
  const rad = ((directionDeg - 90) * Math.PI) / 180;
  const dLat = km / 110.574;
  const dLng = km / (111.32 * Math.cos((center.lat * Math.PI) / 180) || 1);
  const end: [number, number] = [
    center.lng + dLng * Math.cos(rad),
    center.lat + dLat * Math.sin(rad),
  ];
  return {
    type: 'Feature',
    properties: {
      id: 'wind',
      kind: 'wind',
      name: 'Wind',
      detail: `${speedKnots} kt`,
    },
    geometry: {
      type: 'LineString',
      coordinates: [[center.lng, center.lat], end],
    },
  };
}

export function MarineMap() {
  const {
    dashboard,
    profile,
    activeLayers,
    theme,
    selectedId,
    mapFocus,
    focusMap,
    setSelectedId,
    setActivePanel,
    drivingRoute,
  } = useManthan();

  const mapRef = useRef<MapRef>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const night = theme === 'night';
  const locale = profile?.locale ?? 'en';
  const [webglOk] = useState(() => isWebglSupported());
  const [popup, setPopup] = useState<{ lng: number; lat: number; title: string; detail?: string } | null>(
    null,
  );
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [styleFailed, setStyleFailed] = useState(false);
  const [basemapUnavailable, setBasemapUnavailable] = useState(false);
  const tileConfirmedRef = useRef(false);
  const watchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mapStyle: StyleSpecification = useMemo(
    () => buildMapStyle(night, !styleFailed),
    [night, styleFailed],
  );

  const initialViewState = {
    longitude: profile?.location.lng ?? DEFAULT_MAP_CENTER.lng,
    latitude: profile?.location.lat ?? DEFAULT_MAP_CENTER.lat,
    zoom: DEFAULT_MAP_ZOOM,
    bearing: 0,
    pitch: 0,
  };

  useEffect(() => {
    setStyleFailed(false);
  }, [night]);

  // Watchdog: some networks let the style JSON through (so no map "error"
  // event ever fires) but silently block the actual tile requests, leaving a
  // blank/flat-colour map with working markers on top — exactly the failure
  // mode a plain onError handler misses. If no real basemap tile has been
  // confirmed a few seconds after switching style, force the next fallback
  // step (vector -> raster -> a small "basemap unavailable" notice) so the
  // chart never just sits there looking broken.
  useEffect(() => {
    tileConfirmedRef.current = false;
    if (watchdogRef.current) clearTimeout(watchdogRef.current);
    watchdogRef.current = setTimeout(() => {
      if (tileConfirmedRef.current) return;
      // No street tiles arrived: drop to the bundled offline coast/land base,
      // which needs no network and still gives a real, navigable chart.
      if (!styleFailed) setStyleFailed(true);
    }, 6000);
    return () => {
      if (watchdogRef.current) clearTimeout(watchdogRef.current);
    };
  }, [styleFailed, night]);

  const onMapSourceData = (evt: any) => {
    if (evt?.tile) {
      tileConfirmedRef.current = true;
      setBasemapUnavailable(false);
      if (watchdogRef.current) clearTimeout(watchdogRef.current);
    }
  };

  useEffect(() => {
    const el = hostRef.current;
    const map = mapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      mapRef.current?.resize();
    });
    ro.observe(el);
    map?.resize();
    return () => ro.disconnect();
  }, [dashboard, profile]);

  useEffect(() => {
    if (!mapFocus) return;
    const zoom = mapFocus.zoom ?? 10;
    mapRef.current?.flyTo({
      center: [mapFocus.center.lng, mapFocus.center.lat],
      zoom,
      duration: 1100,
      essential: true,
    });
  }, [mapFocus]);

  useEffect(() => {
    if (!profile || mapFocus) return;
    mapRef.current?.flyTo({
      center: [profile.location.lng, profile.location.lat],
      zoom: DEFAULT_MAP_ZOOM,
      duration: 800,
      essential: true,
    });
  }, [profile?.location.lat, profile?.location.lng, mapFocus, profile]);

  useEffect(() => {
    let cancelled = false;
    async function loadRoute() {
      if (!drivingRoute) {
        setRouteCoords([]);
        return;
      }
      const path = await fetchDrivingPath(drivingRoute.origin, drivingRoute.destination);
      if (cancelled) return;
      setRouteCoords(path.coordinates);
      if (path.coordinates.length > 1) {
        const lngs = path.coordinates.map((c) => c[0]);
        const lats = path.coordinates.map((c) => c[1]);
        mapRef.current?.fitBounds(
          [
            [Math.min(...lngs), Math.min(...lats)],
            [Math.max(...lngs), Math.max(...lats)],
          ],
          { padding: 60, duration: 1000 },
        );
      }
    }
    void loadRoute();
    return () => {
      cancelled = true;
    };
  }, [drivingRoute]);

  const pfzGeo = useMemo(() => {
    if (!dashboard || !layerOn(activeLayers, 'pfz')) return toFeatureCollection([]);
    return toFeatureCollection(
      dashboard.nearbyPfz.map((pfz) =>
        polygonFeature(pfz.id, pfz.polygon, {
          name: pfz.name,
          kind: 'pfz',
          selected: selectedId === pfz.id ? 1 : 0,
          detail: `${pfz.distanceKm} km · ${pfz.productivity.replace('_', ' ')}`,
        }),
      ),
    );
  }, [dashboard, activeLayers, selectedId]);

  const geofenceGeo = useMemo(() => {
    if (!dashboard) return toFeatureCollection([]);
    const feats = dashboard.geofences
      .filter((g) => {
        return (
          layerOn(activeLayers, 'geofences') ||
          (g.type === 'mpa' && layerOn(activeLayers, 'mpa')) ||
          (g.type === 'restricted' && layerOn(activeLayers, 'restricted')) ||
          (g.type === 'esa' && layerOn(activeLayers, 'esa')) ||
          (g.type === 'maritime_boundary' && layerOn(activeLayers, 'maritime_boundary'))
        );
      })
      .map((g) =>
        polygonFeature(g.id, g.polygon, {
          name: g.name,
          kind: 'geofence',
          gtype: g.type,
          detail: g.warningMessage,
          color: geofenceColor(g.type, night),
        }),
      );
    return toFeatureCollection(feats);
  }, [dashboard, activeLayers, night]);

  const routeGeo = useMemo((): GeoJSON.FeatureCollection => {
    const coords =
      routeCoords.length > 1
        ? routeCoords
        : layerOn(activeLayers, 'routes') && dashboard?.routes[0]
          ? dashboard.routes[0].waypoints.map((w) => [w.location.lng, w.location.lat] as [number, number])
          : [];
    if (coords.length < 2) return toFeatureCollection([]);
    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { kind: 'route', name: drivingRoute?.label ?? dashboard?.routes[0]?.name ?? 'Route' },
          geometry: { type: 'LineString', coordinates: coords },
        },
      ],
    };
  }, [routeCoords, activeLayers, dashboard, drivingRoute]);

  const oceanFills = useMemo(() => {
    if (!dashboard) return toFeatureCollection([]);
    const features: GeoJSON.Feature[] = [];
    const c = profile?.location ?? DEFAULT_MAP_CENTER;
    if (layerOn(activeLayers, 'sst')) {
      features.push(
        polygonFeature('sst', circlePolygon(dashboard.ocean.sst.location, 18), {
          name: 'SST',
          kind: 'sst',
          detail: `${dashboard.ocean.sst.valueC}°C`,
        }),
      );
    }
    if (layerOn(activeLayers, 'chlorophyll')) {
      features.push(
        polygonFeature(
          'chl',
          circlePolygon(
            {
              lat: dashboard.ocean.chlorophyll.location.lat + 0.15,
              lng: dashboard.ocean.chlorophyll.location.lng - 0.2,
            },
            16,
          ),
          {
            name: 'Chlorophyll-a',
            kind: 'chlorophyll',
            detail: `${dashboard.ocean.chlorophyll.valueMgM3} mg/m³`,
          },
        ),
      );
    }
    if (layerOn(activeLayers, 'waves')) {
      features.push(
        polygonFeature('waves', circlePolygon({ lat: c.lat - 0.1, lng: c.lng - 0.15 }, 14), {
          name: 'Waves',
          kind: 'waves',
          detail: `${dashboard.ocean.waves.heightM} m`,
        }),
      );
    }
    if (layerOn(activeLayers, 'tides')) {
      features.push(
        polygonFeature('tide', circlePolygon(dashboard.ocean.tide.location, 6), {
          name: 'Tide',
          kind: 'tides',
          detail: `${dashboard.ocean.tide.currentHeightM} m (${dashboard.ocean.tide.trend})`,
        }),
      );
    }
    return toFeatureCollection(features);
  }, [dashboard, activeLayers, profile]);

  const windGeo = useMemo(() => {
    if (!dashboard || !layerOn(activeLayers, 'wind')) return toFeatureCollection([]);
    const c = profile?.location ?? DEFAULT_MAP_CENTER;
    return toFeatureCollection([
      windLine(
        { lat: c.lat + 0.12, lng: c.lng - 0.08 },
        dashboard.ocean.wind.speedKnots,
        dashboard.ocean.wind.directionDeg,
      ),
    ]);
  }, [dashboard, activeLayers, profile]);

  /* ---------- Real, sourced advisory data (INCOIS/MODIS/OCM-3, Kochi sector) ---------- */

  const coastlineGeo = useMemo((): GeoJSON.FeatureCollection => {
    if (!layerOn(activeLayers, 'coastline')) return toFeatureCollection([]);
    const features = REAL_KERALA_COASTLINE.features.map((f) => {
      const isPort = f.geometry.type === 'Point';
      return {
        ...f,
        properties: {
          ...f.properties,
          id: f.properties?.name ?? 'coastline',
          kind: isPort ? 'coastline_port' : 'coastline_line',
          name: f.properties?.name ?? (isPort ? 'Port' : 'Coastline'),
          detail: isPort
            ? f.properties?.type
            : `${t(locale, 'dataSource')}: ${REAL_DATA_META.coastline.source}`,
        },
      };
    });
    return toFeatureCollection(features);
  }, [activeLayers, locale]);

  const realPfzGeo = useMemo((): GeoJSON.FeatureCollection => {
    if (!layerOn(activeLayers, 'pfz')) return toFeatureCollection([]);
    const features = REAL_PFZ_KOCHI.features.map((f) => {
      const p = f.properties ?? {};
      const fishTypes = Array.isArray(p.fish_types) ? p.fish_types.join(', ') : '';
      return {
        ...f,
        properties: {
          ...p,
          id: f.id ?? p.zone_name,
          kind: 'real_pfz',
          name: p.zone_name,
          selected: selectedId === (f.id ?? p.zone_name) ? 1 : 0,
          detail: `${p.distance_km} km ${p.direction} · ${p.confidence} · ${fishTypes}`,
          source: REAL_DATA_META.pfz.source,
          validUntil: p.valid_until,
        },
      };
    });
    return toFeatureCollection(features);
  }, [activeLayers, selectedId]);

  const realSstGeo = useMemo((): GeoJSON.FeatureCollection => {
    if (!layerOn(activeLayers, 'sst')) return toFeatureCollection([]);
    const features = REAL_SST_KOCHI.features.map((f, i) => ({
      ...f,
      properties: {
        ...f.properties,
        id: `real-sst-${i}`,
        kind: 'real_sst',
        name: f.properties?.label,
        detail: `${t(locale, 'dataSource')}: ${REAL_DATA_META.sst.source} · ${REAL_DATA_META.sst.date}`,
      },
    }));
    return toFeatureCollection(features);
  }, [activeLayers, locale]);

  const realChlGeo = useMemo((): GeoJSON.FeatureCollection => {
    if (!layerOn(activeLayers, 'chlorophyll')) return toFeatureCollection([]);
    const features = REAL_CHLOROPHYLL_KOCHI.features.map((f, i) => ({
      ...f,
      properties: {
        ...f.properties,
        id: `real-chl-${i}`,
        kind: 'real_chl',
        name: f.properties?.rating,
        detail: `${f.properties?.chlorophyll_mg_m3} mg/m³ · ${t(locale, 'dataSource')}: ${REAL_DATA_META.chlorophyll.source}`,
      },
    }));
    return toFeatureCollection(features);
  }, [activeLayers, locale]);

  const waveAdvisoryGeo = useMemo((): GeoJSON.FeatureCollection => {
    if (!layerOn(activeLayers, 'wave_advisory')) return toFeatureCollection([]);
    const features = REAL_WAVE_ADVISORY.features.map((f, i) => {
      const p = f.properties ?? {};
      return {
        ...f,
        properties: {
          ...p,
          id: `wave-adv-${i}`,
          kind: 'wave_advisory',
          name: `${p.state} · ${p.district}`,
          threat: p.threat_level,
          detail: `${alertTypeLabel(locale, p.alert_type)} · ${threatLevelLabel(locale, p.threat_level)} · ${p.wave_height_m} m`,
          source: p.source,
          issueDate: p.issue_date,
        },
      };
    });
    return toFeatureCollection(features);
  }, [activeLayers, locale]);

  const onMapClick = (e: MapLayerMouseEvent) => {
    const feature = e.features?.[0];
    if (!feature || !feature.properties) {
      setPopup(null);
      return;
    }
    const props = feature.properties;
    const id = String(props.id ?? '');
    const name = String(props.name ?? 'Feature');
    const detail = props.detail ? String(props.detail) : undefined;
    const kind = String(props.kind ?? '');

    if (kind === 'pfz') {
      setSelectedId(id);
      setActivePanel('pfz');
      const pfz = dashboard?.nearbyPfz.find((p) => p.id === id);
      if (pfz) focusMap({ center: pfz.center, zoom: 10, highlightIds: [id] });
    } else if (kind === 'geofence') {
      setSelectedId(id);
      setActivePanel('geofencing');
    } else if (kind === 'life') {
      setSelectedId(id);
      setActivePanel('marine_life');
    } else if (kind === 'real_pfz') {
      setSelectedId(id);
    } else if (kind === 'wave_advisory') {
      setSelectedId(id);
      setActivePanel('safety');
    }

    setPopup({
      lng: e.lngLat.lng,
      lat: e.lngLat.lat,
      title: name,
      detail,
    });
  };

  const onMapError = (evt: ErrorEvent) => {
    const msg = String(evt.error?.message ?? evt.error ?? '');
    if (/style|fetch|tiles\.openfreemap|failed to fetch|network/i.test(msg)) {
      setStyleFailed(true);
    }
  };

  if (!webglOk) {
    return (
      <div className="map-placeholder map-placeholder-error">
        <strong>{t(locale, 'webglUnsupportedTitle')}</strong>
        <p>{t(locale, 'webglUnsupportedDetail')}</p>
      </div>
    );
  }

  if (!dashboard || !profile) {
    return <div className="map-placeholder">{t(locale, 'preparingChart')}</div>;
  }

  return (
    <div className="marine-map" ref={hostRef}>
      <Map
        ref={mapRef}
        initialViewState={initialViewState}
        mapStyle={mapStyle}
        style={{ width: '100%', height: '100%' }}
        attributionControl={{}}
        dragRotate={false}
        pitchWithRotate={false}
        minZoom={4}
        maxZoom={18}
        fadeDuration={200}
        interactiveLayerIds={[
          'pfz-fill',
          'pfz-outline',
          'geofence-fill',
          'sst-fill',
          'chl-fill',
          'waves-fill',
          'tides-fill',
          'wind-line',
          'route-line',
          'real-pfz-fill',
          'real-pfz-outline',
          'real-sst-fill',
          'real-chl-fill',
          'coastline-line',
          'coastline-port',
          'wave-advisory-point',
        ]}
        onClick={onMapClick}
        onError={onMapError}
        onSourceData={onMapSourceData}
        onLoad={(e) => {
          e.target.resize();
        }}
      >
        <NavigationControl position="bottom-right" showCompass={false} visualizePitch={false} />
        <GeolocateControl
          position="bottom-right"
          trackUserLocation
          showUserLocation
          showAccuracyCircle
        />

        <Source id="pfz" type="geojson" data={pfzGeo}>
          <Layer
            id="pfz-fill"
            type="fill"
            paint={{
              'fill-color': night ? '#17465C' : '#9DDCE5',
              'fill-opacity': 0.42,
            }}
          />
          <Layer
            id="pfz-outline"
            type="line"
            paint={{
              'line-color': [
                'case',
                ['==', ['get', 'selected'], 1],
                '#F5D36B',
                night ? '#82C8BF' : '#1687AD',
              ],
              'line-width': ['case', ['==', ['get', 'selected'], 1], 3, 2],
            }}
          />
        </Source>

        {/* Real, sourced INCOIS/OCM-3 PFZ polygons for the Kochi sector (see src/data/real) */}
        <Source id="real-pfz" type="geojson" data={realPfzGeo}>
          <Layer
            id="real-pfz-fill"
            type="fill"
            paint={{ 'fill-color': '#F5D36B', 'fill-opacity': 0.22 }}
          />
          <Layer
            id="real-pfz-outline"
            type="line"
            paint={{
              'line-color': [
                'case',
                ['==', ['get', 'selected'], 1],
                '#F5D36B',
                '#B5892A',
              ],
              'line-width': ['case', ['==', ['get', 'selected'], 1], 3.5, 2.5],
              'line-dasharray': [1, 0],
            }}
          />
        </Source>

        <Source id="geofences" type="geojson" data={geofenceGeo}>
          <Layer
            id="geofence-fill"
            type="fill"
            paint={{
              'fill-color': ['get', 'color'],
              'fill-opacity': 0.18,
            }}
          />
          <Layer
            id="geofence-outline"
            type="line"
            paint={{
              'line-color': ['get', 'color'],
              'line-width': 2,
              'line-dasharray': [2, 1],
            }}
          />
        </Source>

        <Source id="ocean-fills" type="geojson" data={oceanFills}>
          <Layer
            id="sst-fill"
            type="fill"
            filter={['==', ['get', 'kind'], 'sst']}
            paint={{ 'fill-color': '#F5D36B', 'fill-opacity': 0.28 }}
          />
          <Layer
            id="chl-fill"
            type="fill"
            filter={['==', ['get', 'kind'], 'chlorophyll']}
            paint={{ 'fill-color': '#A8CFA9', 'fill-opacity': 0.32 }}
          />
          <Layer
            id="waves-fill"
            type="fill"
            filter={['==', ['get', 'kind'], 'waves']}
            paint={{ 'fill-color': '#1687AD', 'fill-opacity': 0.22 }}
          />
          <Layer
            id="tides-fill"
            type="fill"
            filter={['==', ['get', 'kind'], 'tides']}
            paint={{ 'fill-color': '#EBDDBD', 'fill-opacity': 0.4 }}
          />
        </Source>

        {/* Real SST (MODIS/INSAT-3D) and chlorophyll-a (OCM-3) sample points, Kochi sector */}
        <Source id="real-sst" type="geojson" data={realSstGeo}>
          <Layer
            id="real-sst-fill"
            type="circle"
            paint={{
              'circle-radius': 7,
              'circle-color': '#F5A65B',
              'circle-stroke-width': 1.5,
              'circle-stroke-color': night ? '#1B1B1E' : '#FBF5E8',
            }}
          />
        </Source>

        <Source id="real-chl" type="geojson" data={realChlGeo}>
          <Layer
            id="real-chl-fill"
            type="circle"
            paint={{
              'circle-radius': 7,
              'circle-color': '#5FA86B',
              'circle-stroke-width': 1.5,
              'circle-stroke-color': night ? '#1B1B1E' : '#FBF5E8',
            }}
          />
        </Source>

        <Source id="coastline" type="geojson" data={coastlineGeo}>
          <Layer
            id="coastline-line"
            type="line"
            filter={['==', ['get', 'kind'], 'coastline_line']}
            paint={{ 'line-color': night ? '#EBDDBD' : '#5A4A32', 'line-width': 2 }}
          />
          <Layer
            id="coastline-port"
            type="circle"
            filter={['==', ['get', 'kind'], 'coastline_port']}
            paint={{
              'circle-radius': 5,
              'circle-color': '#C4922A',
              'circle-stroke-width': 1.5,
              'circle-stroke-color': night ? '#1B1B1E' : '#FBF5E8',
            }}
          />
        </Source>

        <Source id="wave-advisory" type="geojson" data={waveAdvisoryGeo}>
          <Layer
            id="wave-advisory-point"
            type="circle"
            paint={{
              'circle-radius': 6,
              'circle-color': ['case', ['==', ['get', 'threat'], 'ALERT'], '#C4453C', '#D6B85A'],
              'circle-stroke-width': 1.5,
              'circle-stroke-color': night ? '#1B1B1E' : '#FBF5E8',
            }}
          />
        </Source>

        <Source id="wind" type="geojson" data={windGeo}>
          <Layer
            id="wind-line"
            type="line"
            paint={{
              'line-color': '#C8B6E8',
              'line-width': 4,
              'line-opacity': 0.9,
            }}
            layout={{ 'line-cap': 'round', 'line-join': 'round' }}
          />
        </Source>

        <Source id="routes" type="geojson" data={routeGeo}>
          <Layer
            id="route-line"
            type="line"
            paint={{
              'line-color': night ? '#D6B85A' : '#1687AD',
              'line-width': 4,
              'line-opacity': 0.92,
            }}
            layout={{ 'line-cap': 'round', 'line-join': 'round' }}
          />
        </Source>

        {layerOn(activeLayers, 'marine_life') &&
          dashboard.marineLife.map((obs) => (
            <Marker
              key={obs.id}
              longitude={obs.location.lng}
              latitude={obs.location.lat}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setSelectedId(obs.id);
                setActivePanel('marine_life');
                setPopup({
                  lng: obs.location.lng,
                  lat: obs.location.lat,
                  title: obs.commonName,
                  detail: `${obs.count} observed · ${obs.notes}`,
                });
                focusMap({ center: obs.location, zoom: 10, highlightIds: [obs.id] });
              }}
            >
              <button
                type="button"
                className={`map-marker life life-${obs.category} ${selectedId === obs.id ? 'selected' : ''}`}
                title={obs.commonName}
              />
            </Marker>
          ))}

        {layerOn(activeLayers, 'vessels') &&
          dashboard.vessels.map((v) => (
            <Marker
              key={v.id}
              longitude={v.location.lng}
              latitude={v.location.lat}
              anchor="center"
              rotation={v.headingDeg}
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setPopup({
                  lng: v.location.lng,
                  lat: v.location.lat,
                  title: v.name,
                  detail: `${v.type} · ${v.speedKnots} kt`,
                });
              }}
            >
              <button type="button" className={`map-marker vessel vessel-${v.type}`} title={v.name} />
            </Marker>
          ))}

        {layerOn(activeLayers, 'user_location') && (
          <Marker
            longitude={profile.location.lng}
            latitude={profile.location.lat}
            anchor="center"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setPopup({
                lng: profile.location.lng,
                lat: profile.location.lat,
                title: t(locale, 'yourLocationLabel'),
                detail: profile.locationLabel,
              });
            }}
          >
            <button type="button" className="map-marker user" title={`You · ${profile.locationLabel}`} />
          </Marker>
        )}

        {popup && (
          <Popup
            longitude={popup.lng}
            latitude={popup.lat}
            anchor="bottom"
            onClose={() => setPopup(null)}
            closeOnClick={false}
            offset={14}
          >
            <div className="maplibre-popup">
              <strong>{popup.title}</strong>
              {popup.detail && <p>{popup.detail}</p>}
            </div>
          </Popup>
        )}
      </Map>

      {basemapUnavailable && (
        <div className="map-toast basemap-warning">{t(locale, 'basemapUnavailableNotice')}</div>
      )}

      {drivingRoute?.label && (
        <div className="map-toast route-ok">
          {t(locale, 'routeToastPrefix')}: {drivingRoute.label}
        </div>
      )}
    </div>
  );
}
