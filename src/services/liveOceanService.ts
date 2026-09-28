import type { Coordinates, Severity } from '../types';

/**
 * Free, no-key-required live marine/weather data from Open-Meteo
 * (marine-api.open-meteo.com + api.open-meteo.com). Non-commercial use.
 * Used to replace mock wave/wind/weather/SST figures with genuinely live
 * numbers wherever the app can reach the network; falls back silently
 * (returns null) so the mock/reference data keeps the app usable offline
 * or if Open-Meteo is unreachable from the current network.
 */

const KMH_TO_KNOTS = 0.539957;

export interface LiveMarineReading {
  waveHeightM: number | null;
  wavePeriodS: number | null;
  waveDirectionDeg: number | null;
  seaSurfaceTempC: number | null;
}

export interface LiveWeatherReading {
  temperatureC: number | null;
  humidityPct: number | null;
  pressureHpa: number | null;
  weatherCode: number | null;
  windSpeedKnots: number | null;
  windGustKnots: number | null;
  windDirectionDeg: number | null;
}

export interface LiveOceanBundle {
  marine: LiveMarineReading | null;
  weather: LiveWeatherReading | null;
  fetchedAt: string;
}

function waveSeverity(heightM: number): Severity {
  if (heightM < 0.5) return 'calm';
  if (heightM < 1.25) return 'moderate';
  if (heightM < 2.5) return 'elevated';
  return 'severe';
}

function windSeverity(knots: number): Severity {
  if (knots < 11) return 'calm';
  if (knots < 22) return 'moderate';
  if (knots < 34) return 'elevated';
  return 'severe';
}

async function fetchJson(url: string, timeoutMs = 6000): Promise<any | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchLiveMarine(loc: Coordinates): Promise<LiveMarineReading | null> {
  const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${loc.lat}&longitude=${loc.lng}&current=wave_height,wave_period,wave_direction,sea_surface_temperature&timezone=auto`;
  const data = await fetchJson(url);
  const c = data?.current;
  if (!c) return null;
  return {
    waveHeightM: typeof c.wave_height === 'number' ? c.wave_height : null,
    wavePeriodS: typeof c.wave_period === 'number' ? c.wave_period : null,
    waveDirectionDeg: typeof c.wave_direction === 'number' ? c.wave_direction : null,
    seaSurfaceTempC: typeof c.sea_surface_temperature === 'number' ? c.sea_surface_temperature : null,
  };
}

async function fetchLiveWeather(loc: Coordinates): Promise<LiveWeatherReading | null> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lng}&current=temperature_2m,relative_humidity_2m,surface_pressure,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m&timezone=auto`;
  const data = await fetchJson(url);
  const c = data?.current;
  if (!c) return null;
  return {
    temperatureC: typeof c.temperature_2m === 'number' ? c.temperature_2m : null,
    humidityPct: typeof c.relative_humidity_2m === 'number' ? c.relative_humidity_2m : null,
    pressureHpa: typeof c.surface_pressure === 'number' ? c.surface_pressure : null,
    weatherCode: typeof c.weather_code === 'number' ? c.weather_code : null,
    windSpeedKnots: typeof c.wind_speed_10m === 'number' ? c.wind_speed_10m * KMH_TO_KNOTS : null,
    windGustKnots: typeof c.wind_gusts_10m === 'number' ? c.wind_gusts_10m * KMH_TO_KNOTS : null,
    windDirectionDeg: typeof c.wind_direction_10m === 'number' ? c.wind_direction_10m : null,
  };
}

export async function fetchLiveOcean(loc: Coordinates): Promise<LiveOceanBundle> {
  const [marine, weather] = await Promise.all([
    fetchLiveMarine(loc).catch(() => null),
    fetchLiveWeather(loc).catch(() => null),
  ]);
  return { marine, weather, fetchedAt: new Date().toISOString() };
}

export { waveSeverity, windSeverity };
