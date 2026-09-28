/** MANTHAN domain types — keep presentation-agnostic for real-data swap later */

export type UserRole =
  | 'fisher'
  | 'researcher'
  | 'observer'
  | 'maritime'
  | 'coastal_authority'
  | 'marine_operator'
  | 'other';

export type UserNeed =
  | 'fishing_zones'
  | 'weather'
  | 'sea_conditions'
  | 'navigation'
  | 'marine_life'
  | 'safety_alerts'
  | 'ocean_analysis'
  | 'research';

export type ThemeMode = 'day' | 'night';

export type LocaleCode =
  | 'en'
  | 'hi'
  | 'mr'
  | 'ml'
  | 'ta'
  | 'te'
  | 'kn'
  | 'bn'
  | 'gu';

export type Severity = 'calm' | 'moderate' | 'elevated' | 'severe';

export type ProductivitySignal = 'low' | 'moderate' | 'high' | 'very_high';

export type SafetyStatus = 'favourable' | 'caution' | 'unfavourable' | 'restricted';

export type AgentId =
  | 'planner'
  | 'marine_data'
  | 'pfz'
  | 'sst'
  | 'chlorophyll'
  | 'weather'
  | 'ocean_analytics'
  | 'geospatial'
  | 'risk_safety'
  | 'route'
  | 'marine_life'
  | 'evidence';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface UserProfile {
  name: string;
  role: UserRole;
  needs: UserNeed[];
  location: Coordinates;
  locationLabel: string;
  locale: LocaleCode;
  onboardingComplete: boolean;
}

export interface SSTReading {
  id: string;
  location: Coordinates;
  valueC: number;
  gradient: 'weak' | 'moderate' | 'strong';
  timestamp: string;
  source: string;
}

export interface ChlorophyllReading {
  id: string;
  location: Coordinates;
  valueMgM3: number;
  level: 'low' | 'moderate' | 'elevated' | 'high';
  timestamp: string;
  source: string;
}

export interface WeatherCondition {
  id: string;
  location: Coordinates;
  description: string;
  temperatureC: number;
  humidityPct: number;
  visibilityKm: number;
  pressureHpa: number;
  timestamp: string;
  source: string;
}

export interface WaveCondition {
  id: string;
  location: Coordinates;
  heightM: number;
  periodS: number;
  directionDeg: number;
  severity: Severity;
  timestamp: string;
  source: string;
}

export interface WindCondition {
  id: string;
  location: Coordinates;
  speedKnots: number;
  gustKnots: number;
  directionDeg: number;
  severity: Severity;
  timestamp: string;
  source: string;
}

export interface TideInfo {
  id: string;
  location: Coordinates;
  locationLabel: string;
  nextHigh: { time: string; heightM: number };
  nextLow: { time: string; heightM: number };
  currentHeightM: number;
  trend: 'rising' | 'falling';
  timestamp: string;
  source: string;
}

export interface PFZ {
  id: string;
  name: string;
  center: Coordinates;
  polygon: Coordinates[];
  distanceKm: number;
  sstC: number;
  chlorophyllMgM3: number;
  waveHeightM: number;
  windKnots: number;
  productivity: ProductivitySignal;
  safety: SafetyStatus;
  validFrom: string;
  validUntil: string;
  source: string;
}

export interface AlertItem {
  id: string;
  type: 'lightning' | 'cyclone' | 'advisory' | 'geofence' | 'weather' | 'wave';
  title: string;
  summary: string;
  severity: Severity;
  location: Coordinates;
  radiusKm?: number;
  issuedAt: string;
  expiresAt?: string;
  source: string;
  actionable?: string;
}

export interface SafetyAssessment {
  id: string;
  overall: SafetyStatus;
  severity: Severity;
  summary: string;
  wave: WaveCondition;
  wind: WindCondition;
  weather: WeatherCondition;
  tide: TideInfo;
  alerts: AlertItem[];
  recommendations: string[];
  timestamp: string;
}

export interface MarineLifeObservation {
  id: string;
  species: string;
  commonName: string;
  category: 'dolphin' | 'turtle' | 'whale' | 'fish' | 'other';
  location: Coordinates;
  count: number;
  observedAt: string;
  observer: string;
  notes: string;
  confidence: 'low' | 'medium' | 'high';
}

export type GeofenceType =
  | 'maritime_boundary'
  | 'restricted'
  | 'mpa'
  | 'esa'
  | 'operational';

export interface GeofenceZone {
  id: string;
  name: string;
  type: GeofenceType;
  polygon: Coordinates[];
  severity: Severity;
  description: string;
  warningMessage: string;
  source: string;
}

export interface Vessel {
  id: string;
  name: string;
  type: 'fishing' | 'cargo' | 'patrol' | 'research';
  location: Coordinates;
  headingDeg: number;
  speedKnots: number;
  lastUpdate: string;
}

export interface RoutePoint {
  location: Coordinates;
  label?: string;
  eta?: string;
  note?: string;
}

export interface PlannedRoute {
  id: string;
  name: string;
  origin: Coordinates;
  destination: Coordinates;
  waypoints: RoutePoint[];
  distanceNm: number;
  estimatedHours: number;
  safety: SafetyStatus;
  considerations: string[];
  avoidedZones: string[];
  weatherSummary: string;
  timestamp: string;
}

export interface EvidenceSource {
  id: string;
  label: string;
  dataset: string;
  timestamp: string;
  url?: string;
  reliability: 'observed' | 'modelled' | 'advisory';
}

export interface DataPoint {
  label: string;
  value: string;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  locale?: LocaleCode;
  /** Explainable AI structure */
  explanation?: {
    data: DataPoint[];
    interpretation: string;
    safety?: string;
    evidence: EvidenceSource[];
    agentsInvolved: AgentId[];
    actionable?: string[];
    mapFocus?: {
      center: Coordinates;
      zoom?: number;
      highlightIds?: string[];
      layers?: MapLayerId[];
    };
  };
  status?: 'pending' | 'planning' | 'complete' | 'error';
}

export type MapLayerId =
  | 'pfz'
  | 'sst'
  | 'chlorophyll'
  | 'wind'
  | 'waves'
  | 'tides'
  | 'user_location'
  | 'vessels'
  | 'marine_life'
  | 'mpa'
  | 'restricted'
  | 'esa'
  | 'maritime_boundary'
  | 'geofences'
  | 'routes'
  | 'coastline'
  | 'wave_advisory';

export interface MapLayerConfig {
  id: MapLayerId;
  label: string;
  description: string;
  group: 'ocean' | 'safety' | 'ops' | 'life';
  defaultOn: boolean;
}

export interface OceanSnapshot {
  sst: SSTReading;
  chlorophyll: ChlorophyllReading;
  weather: WeatherCondition;
  waves: WaveCondition;
  wind: WindCondition;
  tide: TideInfo;
  timestamp: string;
}

export interface DashboardSnapshot {
  location: Coordinates;
  locationLabel: string;
  ocean: OceanSnapshot;
  safety: SafetyAssessment;
  alerts: AlertItem[];
  nearbyPfz: PFZ[];
  marineLife: MarineLifeObservation[];
  vessels: Vessel[];
  geofences: GeofenceZone[];
  routes: PlannedRoute[];
}

export type PanelId =
  | 'overview'
  | 'ask'
  | 'pfz'
  | 'safety'
  | 'marine_life'
  | 'geofencing'
  | 'routes'
  | 'layers'
  | 'calculator';

export interface LoadingState {
  status: 'idle' | 'loading' | 'success' | 'error' | 'empty';
  message?: string;
}
