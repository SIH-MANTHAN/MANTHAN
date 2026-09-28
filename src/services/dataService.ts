import type { DashboardSnapshot, Coordinates, LocaleCode } from '../types';
import { buildDashboardSnapshot, mapLayers } from '../data/mock/marine';
import { getSuggestedQuestionsForLocale } from '../i18n/chat';
import { openExternalDirections } from '../utils/maps';

/** Data access layer — replace implementations with real API clients later */

export async function fetchDashboard(
  location?: Coordinates,
  locationLabel?: string,
  locale: LocaleCode = 'en',
): Promise<DashboardSnapshot> {
  await new Promise((r) => setTimeout(r, 450));
  return buildDashboardSnapshot(location, locationLabel, locale);
}

export function getMapLayers() {
  return mapLayers;
}

export function getSuggestedQuestions(locale: LocaleCode = 'en') {
  return getSuggestedQuestionsForLocale(locale);
}

/** Opens OSM + OSRM directions in a new tab (no Google key) */
export function navigateToCoordinates(
  destination: Coordinates,
  origin?: Coordinates,
  _label?: string,
) {
  openExternalDirections(destination, origin);
}
