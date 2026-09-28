import type { ChatMessage, Coordinates, LocaleCode } from '../types';
import {
  mockAlerts,
  mockChlorophyll,
  mockPfz,
  mockRoutes,
  mockSafety,
  mockSST,
  mockWaves,
  mockWind,
} from '../data/mock/marine';
import { detectIntent, localizeChat } from '../i18n/chat';

function id() {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Simple intent routing over mock data — responses follow user locale */
export async function askManthan(
  question: string,
  locale: LocaleCode = 'en',
  userLocation?: Coordinates,
): Promise<ChatMessage> {
  await delay(900 + Math.random() * 700);

  const intent = detectIntent(question);
  const center = userLocation ?? { lat: 18.9207, lng: 72.8305 };

  if (intent === 'pfz') {
    const nearest = [...mockPfz].sort((a, b) => a.distanceKm - b.distanceKm)[0];
    const loc = localizeChat('pfz', locale, {
      name: nearest.name,
      distance: nearest.distanceKm,
      productivity: nearest.productivity.replace('_', ' '),
      safety: nearest.safety,
      wave: nearest.waveHeightM,
      wind: nearest.windKnots,
    });
    return {
      id: id(),
      role: 'assistant',
      content: loc.content,
      timestamp: new Date().toISOString(),
      locale,
      status: 'complete',
      explanation: {
        data: [
          { label: 'PFZ', value: nearest.name },
          { label: 'Distance', value: String(nearest.distanceKm), unit: 'km' },
          { label: 'SST', value: String(nearest.sstC), unit: '°C' },
          { label: 'Chlorophyll', value: String(nearest.chlorophyllMgM3), unit: 'mg/m³' },
          { label: 'Wave height', value: String(nearest.waveHeightM), unit: 'm' },
          { label: 'Wind', value: String(nearest.windKnots), unit: 'kt' },
        ],
        interpretation: loc.interpretation,
        safety: loc.safety,
        evidence: [
          {
            id: 'e1',
            label: 'INCOIS PFZ Advisory',
            dataset: 'Potential Fishing Zone',
            timestamp: nearest.validFrom,
            reliability: 'advisory',
          },
          {
            id: 'e2',
            label: 'SST Composite',
            dataset: 'Sea Surface Temperature',
            timestamp: mockSST.timestamp,
            reliability: 'observed',
          },
          {
            id: 'e3',
            label: 'Chlorophyll-a',
            dataset: 'Ocean Colour',
            timestamp: mockChlorophyll.timestamp,
            reliability: 'modelled',
          },
        ],
        agentsInvolved: ['planner', 'pfz', 'sst', 'chlorophyll', 'risk_safety', 'evidence'],
        actionable: loc.actionable,
        mapFocus: {
          center: nearest.center,
          zoom: 9,
          highlightIds: [nearest.id],
          layers: ['pfz', 'user_location'],
        },
      },
    };
  }

  if (intent === 'safety') {
    const loc = localizeChat('safety', locale, {
      overall: mockSafety.overall,
      summary: mockSafety.summary,
      recommendations: mockSafety.recommendations.join('|'),
    });
    return {
      id: id(),
      role: 'assistant',
      content: loc.content,
      timestamp: new Date().toISOString(),
      locale,
      status: 'complete',
      explanation: {
        data: [
          { label: 'Wave height', value: String(mockWaves.heightM), unit: 'm' },
          { label: 'Wind', value: String(mockWind.speedKnots), unit: 'kt' },
          { label: 'Gusts', value: String(mockWind.gustKnots), unit: 'kt' },
          { label: 'Visibility', value: String(mockSafety.weather.visibilityKm), unit: 'km' },
          { label: 'Tide trend', value: mockSafety.tide.trend },
        ],
        interpretation: loc.interpretation,
        safety: loc.safety ?? mockSafety.summary,
        evidence: [
          {
            id: 'e1',
            label: 'Ocean State Forecast',
            dataset: 'Waves / Wind',
            timestamp: mockWaves.timestamp,
            reliability: 'modelled',
          },
          {
            id: 'e2',
            label: 'IMD Coastal Bulletin',
            dataset: 'Weather / Lightning',
            timestamp: mockAlerts[1]?.issuedAt ?? mockSafety.timestamp,
            reliability: 'advisory',
          },
        ],
        agentsInvolved: ['planner', 'weather', 'risk_safety', 'ocean_analytics', 'evidence'],
        actionable: loc.actionable.length ? loc.actionable : mockSafety.recommendations,
        mapFocus: { center, zoom: 8, layers: ['waves', 'wind', 'user_location'] },
      },
    };
  }

  if (intent === 'chlorophyll') {
    const loc = localizeChat('chlorophyll', locale, {
      sst: mockSST.valueC,
      gradient: mockSST.gradient,
      chl: mockChlorophyll.valueMgM3,
      level: mockChlorophyll.level,
    });
    return {
      id: id(),
      role: 'assistant',
      content: loc.content,
      timestamp: new Date().toISOString(),
      locale,
      status: 'complete',
      explanation: {
        data: [
          { label: 'SST', value: String(mockSST.valueC), unit: '°C', trend: 'stable' },
          { label: 'SST gradient', value: mockSST.gradient },
          { label: 'Chlorophyll', value: String(mockChlorophyll.valueMgM3), unit: 'mg/m³', trend: 'up' },
          { label: 'Level', value: mockChlorophyll.level },
        ],
        interpretation: loc.interpretation,
        evidence: [
          {
            id: 'e1',
            label: mockSST.source,
            dataset: 'SST',
            timestamp: mockSST.timestamp,
            reliability: 'observed',
          },
          {
            id: 'e2',
            label: mockChlorophyll.source,
            dataset: 'Chlorophyll-a',
            timestamp: mockChlorophyll.timestamp,
            reliability: 'modelled',
          },
        ],
        agentsInvolved: ['sst', 'chlorophyll', 'ocean_analytics', 'evidence'],
        actionable: loc.actionable,
        mapFocus: { center, zoom: 8, layers: ['sst', 'chlorophyll', 'pfz'] },
      },
    };
  }

  if (intent === 'alerts') {
    const primary = mockAlerts[0];
    const loc = localizeChat('alerts', locale, {
      count: mockAlerts.length,
      title: primary.title,
      summary: primary.summary,
      actions: mockAlerts
        .filter((a) => a.actionable)
        .map((a) => a.actionable!)
        .join('|'),
    });
    return {
      id: id(),
      role: 'assistant',
      content: loc.content,
      timestamp: new Date().toISOString(),
      locale,
      status: 'complete',
      explanation: {
        data: mockAlerts.map((a) => ({ label: a.title, value: a.severity })),
        interpretation: loc.interpretation,
        safety: loc.safety,
        evidence: mockAlerts.map((a) => ({
          id: a.id,
          label: a.source,
          dataset: a.type,
          timestamp: a.issuedAt,
          reliability: 'advisory' as const,
        })),
        agentsInvolved: ['weather', 'risk_safety', 'geospatial', 'evidence'],
        actionable: loc.actionable,
        mapFocus: {
          center: primary.location,
          zoom: 8,
          highlightIds: mockAlerts.map((a) => a.id),
          layers: ['user_location', 'waves'],
        },
      },
    };
  }

  if (intent === 'route') {
    const route = mockRoutes[0];
    const loc = localizeChat('route', locale, {
      name: route.name,
      distance: route.distanceNm,
      hours: route.estimatedHours,
      safety: route.safety,
      weather: route.weatherSummary,
      considerations: route.considerations.join(' '),
      avoided: route.avoidedZones.join(', ') || 'none',
    });
    return {
      id: id(),
      role: 'assistant',
      content: loc.content,
      timestamp: new Date().toISOString(),
      locale,
      status: 'complete',
      explanation: {
        data: [
          { label: 'Distance', value: String(route.distanceNm), unit: 'nm' },
          { label: 'ETA window', value: String(route.estimatedHours), unit: 'h' },
          { label: 'Safety', value: route.safety },
        ],
        interpretation: loc.interpretation || route.considerations.join(' '),
        safety: loc.safety,
        evidence: [
          {
            id: 'e1',
            label: 'Route Agent composite',
            dataset: 'Weather + Waves + Geofence',
            timestamp: route.timestamp,
            reliability: 'modelled',
          },
        ],
        agentsInvolved: ['route', 'weather', 'risk_safety', 'geospatial', 'evidence'],
        actionable: loc.actionable,
        mapFocus: {
          center: route.destination,
          zoom: 9,
          highlightIds: [route.id],
          layers: ['routes', 'restricted', 'pfz', 'user_location'],
        },
      },
    };
  }

  if (intent === 'conditions') {
    const loc = localizeChat('conditions', locale, {
      wave: mockWaves.heightM,
      wind: mockWind.speedKnots,
      sst: mockSST.valueC,
      tideTrend: mockSafety.tide.trend,
      tideHeight: mockSafety.tide.currentHeightM,
      weather: mockSafety.weather.description,
    });
    return {
      id: id(),
      role: 'assistant',
      content: loc.content,
      timestamp: new Date().toISOString(),
      locale,
      status: 'complete',
      explanation: {
        data: [
          { label: 'Waves', value: String(mockWaves.heightM), unit: 'm' },
          { label: 'Wind', value: String(mockWind.speedKnots), unit: 'kt' },
          { label: 'SST', value: String(mockSST.valueC), unit: '°C' },
          { label: 'Tide', value: `${mockSafety.tide.currentHeightM} m (${mockSafety.tide.trend})` },
          { label: 'Visibility', value: String(mockSafety.weather.visibilityKm), unit: 'km' },
        ],
        interpretation: loc.interpretation,
        safety: loc.safety,
        evidence: [
          {
            id: 'e1',
            label: mockWaves.source,
            dataset: 'Waves',
            timestamp: mockWaves.timestamp,
            reliability: 'modelled',
          },
          {
            id: 'e2',
            label: mockSafety.tide.source,
            dataset: 'Tides',
            timestamp: mockSafety.tide.timestamp,
            reliability: 'observed',
          },
        ],
        agentsInvolved: ['marine_data', 'weather', 'ocean_analytics', 'evidence'],
        actionable: loc.actionable,
        mapFocus: { center, zoom: 9, layers: ['waves', 'wind', 'tides', 'user_location'] },
      },
    };
  }

  const loc = localizeChat('default', locale, {
    sst: mockSST.valueC,
    chl: mockChlorophyll.valueMgM3,
    wave: mockWaves.heightM,
  });
  return {
    id: id(),
    role: 'assistant',
    content: loc.content,
    timestamp: new Date().toISOString(),
    locale,
    status: 'complete',
    explanation: {
      data: [
        { label: 'SST', value: String(mockSST.valueC), unit: '°C' },
        { label: 'Chlorophyll', value: String(mockChlorophyll.valueMgM3), unit: 'mg/m³' },
        { label: 'Waves', value: String(mockWaves.heightM), unit: 'm' },
      ],
      interpretation: loc.interpretation,
      evidence: [
        {
          id: 'e1',
          label: 'Marine Data Agent composite',
          dataset: 'Multi-source',
          timestamp: new Date().toISOString(),
          reliability: 'modelled',
        },
      ],
      agentsInvolved: ['planner', 'marine_data', 'evidence'],
      actionable: loc.actionable,
      mapFocus: { center, zoom: 8, layers: ['pfz', 'user_location'] },
    },
  };
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
