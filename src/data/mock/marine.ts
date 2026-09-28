import type {
  AlertItem,
  ChatMessage,
  ChlorophyllReading,
  DashboardSnapshot,
  GeofenceZone,
  LocaleCode,
  MapLayerConfig,
  MarineLifeObservation,
  OceanSnapshot,
  PFZ,
  PlannedRoute,
  SafetyAssessment,
  SSTReading,
  TideInfo,
  Vessel,
  WaveCondition,
  WeatherCondition,
  WindCondition,
} from '../../types';
import { localizeDashboard } from '../../i18n/dashboardContent';

/** Coastal Maharashtra / Konkan reference — replace with live feeds later */
export const DEFAULT_LOCATION = { lat: 18.9207, lng: 72.8305 };
export const DEFAULT_LOCATION_LABEL = 'Mumbai Harbour approaches';

const now = () => new Date().toISOString();
const hoursAgo = (h: number) => new Date(Date.now() - h * 3600000).toISOString();
const hoursFromNow = (h: number) => new Date(Date.now() + h * 3600000).toISOString();

export const mockSST: SSTReading = {
  id: 'sst-1',
  location: DEFAULT_LOCATION,
  valueC: 28.4,
  gradient: 'moderate',
  timestamp: hoursAgo(2),
  source: 'INCOIS SST Composite (placeholder)',
};

export const mockChlorophyll: ChlorophyllReading = {
  id: 'chl-1',
  location: DEFAULT_LOCATION,
  valueMgM3: 0.72,
  level: 'elevated',
  timestamp: hoursAgo(6),
  source: 'MODIS/VIIRS Chlorophyll-a (placeholder)',
};

export const mockWeather: WeatherCondition = {
  id: 'wx-1',
  location: DEFAULT_LOCATION,
  description: 'Partly cloudy with light sea breeze',
  temperatureC: 29,
  humidityPct: 74,
  visibilityKm: 12,
  pressureHpa: 1012,
  timestamp: hoursAgo(1),
  source: 'IMD Coastal Observation (placeholder)',
};

export const mockWaves: WaveCondition = {
  id: 'wave-1',
  location: DEFAULT_LOCATION,
  heightM: 1.4,
  periodS: 8,
  directionDeg: 240,
  severity: 'moderate',
  timestamp: hoursAgo(1),
  source: 'INCOIS Wave Watch (placeholder)',
};

export const mockWind: WindCondition = {
  id: 'wind-1',
  location: DEFAULT_LOCATION,
  speedKnots: 12,
  gustKnots: 18,
  directionDeg: 255,
  severity: 'calm',
  timestamp: hoursAgo(1),
  source: 'Coastal AWS (placeholder)',
};

export const mockTide: TideInfo = {
  id: 'tide-1',
  location: DEFAULT_LOCATION,
  locationLabel: 'Apollo Bunder',
  nextHigh: { time: hoursFromNow(4.5), heightM: 3.8 },
  nextLow: { time: hoursFromNow(10.2), heightM: 1.1 },
  currentHeightM: 2.4,
  trend: 'rising',
  timestamp: now(),
  source: 'Survey of India Tide Tables (placeholder)',
};

export const mockOcean: OceanSnapshot = {
  sst: mockSST,
  chlorophyll: mockChlorophyll,
  weather: mockWeather,
  waves: mockWaves,
  wind: mockWind,
  tide: mockTide,
  timestamp: now(),
};

export const mockPfz: PFZ[] = [
  {
    id: 'pfz-konkan-a',
    name: 'Konkan Shelf PFZ-A',
    center: { lat: 18.65, lng: 72.45 },
    polygon: [
      { lat: 18.72, lng: 72.38 },
      { lat: 18.72, lng: 72.52 },
      { lat: 18.58, lng: 72.52 },
      { lat: 18.58, lng: 72.38 },
    ],
    distanceKm: 42,
    sstC: 28.6,
    chlorophyllMgM3: 0.85,
    waveHeightM: 1.2,
    windKnots: 10,
    productivity: 'high',
    safety: 'favourable',
    validFrom: hoursAgo(12),
    validUntil: hoursFromNow(36),
    source: 'INCOIS PFZ Advisory (placeholder)',
  },
  {
    id: 'pfz-ratnagiri-b',
    name: 'Ratnagiri Bank PFZ-B',
    center: { lat: 17.95, lng: 72.2 },
    polygon: [
      { lat: 18.05, lng: 72.1 },
      { lat: 18.05, lng: 72.3 },
      { lat: 17.85, lng: 72.3 },
      { lat: 17.85, lng: 72.1 },
    ],
    distanceKm: 118,
    sstC: 27.9,
    chlorophyllMgM3: 0.94,
    waveHeightM: 1.6,
    windKnots: 14,
    productivity: 'very_high',
    safety: 'caution',
    validFrom: hoursAgo(12),
    validUntil: hoursFromNow(36),
    source: 'INCOIS PFZ Advisory (placeholder)',
  },
  {
    id: 'pfz-thane-c',
    name: 'Thane Creek Outer PFZ-C',
    center: { lat: 19.05, lng: 72.75 },
    polygon: [
      { lat: 19.12, lng: 72.68 },
      { lat: 19.12, lng: 72.82 },
      { lat: 18.98, lng: 72.82 },
      { lat: 18.98, lng: 72.68 },
    ],
    distanceKm: 18,
    sstC: 28.2,
    chlorophyllMgM3: 0.61,
    waveHeightM: 0.9,
    windKnots: 8,
    productivity: 'moderate',
    safety: 'favourable',
    validFrom: hoursAgo(8),
    validUntil: hoursFromNow(28),
    source: 'INCOIS PFZ Advisory (placeholder)',
  },
];

export const mockAlerts: AlertItem[] = [
  {
    id: 'alert-1',
    type: 'advisory',
    title: 'Moderate swell advisory',
    summary:
      'Swell heights of 1.5–2.0 m expected along the north Maharashtra coast through tomorrow morning.',
    severity: 'moderate',
    location: { lat: 18.8, lng: 72.6 },
    radiusKm: 80,
    issuedAt: hoursAgo(3),
    expiresAt: hoursFromNow(18),
    source: 'INCOIS Ocean State Forecast (placeholder)',
    actionable: 'Plan shorter trips and return before evening swell build-up.',
  },
  {
    id: 'alert-2',
    type: 'lightning',
    title: 'Isolated thunderstorm cells',
    summary: 'Isolated lightning possible 40–60 nm offshore west of Alibag after 16:00 IST.',
    severity: 'elevated',
    location: { lat: 18.4, lng: 72.1 },
    radiusKm: 35,
    issuedAt: hoursAgo(1),
    expiresAt: hoursFromNow(8),
    source: 'IMD Nowcast (placeholder)',
    actionable: 'Avoid prolonged exposure in open water during late afternoon.',
  },
  {
    id: 'alert-3',
    type: 'geofence',
    title: 'Approach to restricted waters',
    summary: 'Vessel traffic near operational boundary — maintain watch and AIS.',
    severity: 'calm',
    location: { lat: 18.95, lng: 72.9 },
    issuedAt: hoursAgo(5),
    source: 'MANTHAN Geofence Monitor (placeholder)',
  },
];

export const mockSafety: SafetyAssessment = {
  id: 'safety-1',
  overall: 'caution',
  severity: 'moderate',
  summary:
    'Moderate sea conditions based on current wave and wind observations. Favourable for experienced crews with shorter operational windows.',
  wave: mockWaves,
  wind: mockWind,
  weather: mockWeather,
  tide: mockTide,
  alerts: mockAlerts,
  recommendations: [
    'Depart after morning low swell period',
    'Carry VHF and monitor IMD coastal bulletins',
    'Avoid extended overnight stays offshore today',
  ],
  timestamp: now(),
};

export const mockMarineLife: MarineLifeObservation[] = [
  {
    id: 'life-1',
    species: 'Tursiops aduncus',
    commonName: 'Indo-Pacific bottlenose dolphin',
    category: 'dolphin',
    location: { lat: 18.78, lng: 72.55 },
    count: 6,
    observedAt: hoursAgo(4),
    observer: 'Coastal Observer Network',
    notes: 'Pod travelling north parallel to shelf break.',
    confidence: 'high',
  },
  {
    id: 'life-2',
    species: 'Chelonia mydas',
    commonName: 'Green sea turtle',
    category: 'turtle',
    location: { lat: 18.55, lng: 72.7 },
    count: 1,
    observedAt: hoursAgo(9),
    observer: 'Fisher report — Verified',
    notes: 'Surface observation near reef fringe.',
    confidence: 'medium',
  },
  {
    id: 'life-3',
    species: 'Balaenoptera edeni',
    commonName: 'Bryde\'s whale',
    category: 'whale',
    location: { lat: 18.2, lng: 72.05 },
    count: 1,
    observedAt: hoursAgo(28),
    observer: 'Research transect',
    notes: 'Single adult; feeding behaviour noted.',
    confidence: 'high',
  },
];

export const mockGeofences: GeofenceZone[] = [
  {
    id: 'geo-mpa-1',
    name: 'Malvan Marine Sanctuary buffer',
    type: 'mpa',
    polygon: [
      { lat: 16.1, lng: 73.4 },
      { lat: 16.1, lng: 73.55 },
      { lat: 15.95, lng: 73.55 },
      { lat: 15.95, lng: 73.4 },
    ],
    severity: 'elevated',
    description: 'Marine protected area with seasonal fishing restrictions.',
    warningMessage: 'You are approaching a marine protected area. Verify permitted activities.',
    source: 'MoEFCC / State Forest (placeholder)',
  },
  {
    id: 'geo-restricted-1',
    name: 'Harbour approach restricted lane',
    type: 'restricted',
    polygon: [
      { lat: 18.95, lng: 72.82 },
      { lat: 18.95, lng: 72.92 },
      { lat: 18.88, lng: 72.92 },
      { lat: 18.88, lng: 72.82 },
    ],
    severity: 'elevated',
    description: 'Restricted navigation corridor for commercial traffic.',
    warningMessage: 'Restricted waters ahead. Maintain designated channel.',
    source: 'Port Authority (placeholder)',
  },
  {
    id: 'geo-boundary-1',
    name: 'Indicative maritime boundary segment',
    type: 'maritime_boundary',
    polygon: [
      { lat: 19.5, lng: 71.8 },
      { lat: 19.5, lng: 71.9 },
      { lat: 18.0, lng: 71.9 },
      { lat: 18.0, lng: 71.8 },
    ],
    severity: 'severe',
    description: 'Placeholder international maritime boundary corridor.',
    warningMessage: 'Approaching maritime boundary. Do not cross without clearance.',
    source: 'Maritime boundary reference (placeholder)',
  },
  {
    id: 'geo-esa-1',
    name: 'Coastal ESA — nesting fringe',
    type: 'esa',
    polygon: [
      { lat: 18.35, lng: 72.85 },
      { lat: 18.35, lng: 72.95 },
      { lat: 18.25, lng: 72.95 },
      { lat: 18.25, lng: 72.85 },
    ],
    severity: 'moderate',
    description: 'Ecologically sensitive zone near turtle nesting habitat.',
    warningMessage: 'Ecologically sensitive zone — minimise disturbance and lighting.',
    source: 'Coastal ESA inventory (placeholder)',
  },
];

export const mockVessels: Vessel[] = [
  {
    id: 'v-1',
    name: 'MFV Konkan Star',
    type: 'fishing',
    location: { lat: 18.7, lng: 72.5 },
    headingDeg: 280,
    speedKnots: 6,
    lastUpdate: hoursAgo(0.2),
  },
  {
    id: 'v-2',
    name: 'INS Observer-12',
    type: 'patrol',
    location: { lat: 18.9, lng: 72.65 },
    headingDeg: 195,
    speedKnots: 12,
    lastUpdate: hoursAgo(0.1),
  },
  {
    id: 'v-3',
    name: 'RV Sagar Mitra',
    type: 'research',
    location: { lat: 18.4, lng: 72.35 },
    headingDeg: 90,
    speedKnots: 4,
    lastUpdate: hoursAgo(0.5),
  },
];

export const mockRoutes: PlannedRoute[] = [
  {
    id: 'route-1',
    name: 'Harbour → Konkan PFZ-A',
    origin: DEFAULT_LOCATION,
    destination: mockPfz[0].center,
    waypoints: [
      { location: DEFAULT_LOCATION, label: 'Depart harbour', eta: hoursFromNow(0.5) },
      { location: { lat: 18.8, lng: 72.6 }, label: 'Clear channel', eta: hoursFromNow(1.2) },
      { location: { lat: 18.7, lng: 72.5 }, label: 'Shelf transit', eta: hoursFromNow(2.5) },
      { location: mockPfz[0].center, label: 'PFZ-A arrival', eta: hoursFromNow(3.8) },
    ],
    distanceNm: 24,
    estimatedHours: 3.8,
    safety: 'favourable',
    considerations: [
      'Avoids restricted harbour lane',
      'Routes west of isolated thunderstorm cell',
      'Wave heights remain below 1.5 m along track',
    ],
    avoidedZones: ['Harbour approach restricted lane'],
    weatherSummary: 'Light SW breeze, moderate visibility, rising tide on departure.',
    timestamp: now(),
  },
];

export const mapLayers: MapLayerConfig[] = [
  { id: 'pfz', label: 'Potential Fishing Zones', description: 'Advisory PFZ polygons', group: 'ocean', defaultOn: true },
  { id: 'sst', label: 'Sea Surface Temperature', description: 'SST sample points', group: 'ocean', defaultOn: false },
  { id: 'chlorophyll', label: 'Chlorophyll-a', description: 'Productivity indicators', group: 'ocean', defaultOn: false },
  { id: 'wind', label: 'Wind', description: 'Wind vectors', group: 'ocean', defaultOn: false },
  { id: 'waves', label: 'Waves', description: 'Wave height field', group: 'ocean', defaultOn: false },
  { id: 'tides', label: 'Tides', description: 'Tide stations', group: 'ocean', defaultOn: false },
  { id: 'coastline', label: 'Coastline', description: 'Reference coastline & ports', group: 'ocean', defaultOn: true },
  { id: 'user_location', label: 'My location', description: 'Your reported position', group: 'ops', defaultOn: true },
  { id: 'vessels', label: 'Vessels', description: 'Nearby vessel positions', group: 'ops', defaultOn: true },
  { id: 'routes', label: 'Routes', description: 'Planned vessel routes', group: 'ops', defaultOn: true },
  { id: 'marine_life', label: 'Marine life', description: 'Wildlife observations', group: 'life', defaultOn: true },
  { id: 'mpa', label: 'Protected areas', description: 'Marine protected areas', group: 'safety', defaultOn: true },
  { id: 'restricted', label: 'Restricted waters', description: 'Operational restrictions', group: 'safety', defaultOn: true },
  { id: 'esa', label: 'Sensitive zones', description: 'Ecologically sensitive areas', group: 'safety', defaultOn: false },
  { id: 'maritime_boundary', label: 'Maritime boundaries', description: 'Boundary corridors', group: 'safety', defaultOn: true },
  { id: 'geofences', label: 'All geofences', description: 'Combined geofence layer', group: 'safety', defaultOn: false },
  { id: 'wave_advisory', label: 'Wave/swell advisory', description: 'INCOIS high-wave & swell surge advisory (multi-region)', group: 'safety', defaultOn: false },
];

export const suggestedQuestions = [
  'Where is the nearest PFZ today?',
  'Is it safe to go fishing tomorrow morning?',
  'What are the sea conditions near me?',
  'Show areas with high chlorophyll.',
  'Are there any alerts nearby?',
  'What is the safest route to Konkan PFZ-A?',
];

export const mockChatSeed: ChatMessage[] = [
  {
    id: 'sys-1',
    role: 'system',
    content:
      'MANTHAN is ready. Ask about fishing zones, sea conditions, safety, routes, or marine observations.',
    timestamp: now(),
  },
];

export function buildDashboardSnapshot(
  location = DEFAULT_LOCATION,
  locationLabel = DEFAULT_LOCATION_LABEL,
  locale: LocaleCode = 'en',
): DashboardSnapshot {
  const snapshot: DashboardSnapshot = {
    location,
    locationLabel,
    ocean: mockOcean,
    safety: mockSafety,
    alerts: mockAlerts,
    nearbyPfz: mockPfz,
    marineLife: mockMarineLife,
    vessels: mockVessels,
    geofences: mockGeofences,
    routes: mockRoutes,
  };
  return localizeDashboard(snapshot, locale);
}
