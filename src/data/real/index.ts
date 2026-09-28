/**
 * Real, sourced marine advisory data (INCOIS / MODIS / OCM-3), supplied by the
 * user for the Kochi (Kerala) coastal sector and a multi-region wave/swell
 * advisory. These are NOT synthetic/mock — each file carries its own issue
 * date and data source in its properties, shown to the user via popups and
 * the "authentic advisory data" badge.
 *
 * A placeholder file (sst_chlorophyll_wind_PLACEHOLDER_2026-09-16.geojson,
 * explicitly labelled by its source as "not from INCOIS/ISRO... pending
 * MOSDAC account approval") was intentionally NOT wired in here — the user
 * asked not to have placeholder values presented as real observations.
 */
import pfzKochiRaw from './pfz_kochi_2026-09-11.json';
import sstKochiRaw from './sst_kochi_2026-09-11.json';
import chlorophyllKochiRaw from './chlorophyll_kochi_2026-09-11.json';
import keralaCoastlineRaw from './kerala_coastline.json';
import waveAdvisoryRaw from './wave_swell_advisory_multiregion_2026-09-15.json';

export const REAL_PFZ_KOCHI = pfzKochiRaw as GeoJSON.FeatureCollection;
export const REAL_SST_KOCHI = sstKochiRaw as GeoJSON.FeatureCollection;
export const REAL_CHLOROPHYLL_KOCHI = chlorophyllKochiRaw as GeoJSON.FeatureCollection;
export const REAL_KERALA_COASTLINE = keralaCoastlineRaw as GeoJSON.FeatureCollection;
export const REAL_WAVE_ADVISORY = waveAdvisoryRaw as GeoJSON.FeatureCollection;

export const REAL_DATA_META = {
  pfz: {
    date: '2026-09-11',
    region: 'Kerala Central (Kochi)',
    source: 'INCOIS / Ocean State Advisory Integration',
  },
  sst: {
    date: '2026-09-11',
    parameter: 'Sea Surface Temperature (°C)',
    source: 'MODIS / INSAT-3D Thermal Infrared',
  },
  chlorophyll: {
    date: '2026-09-11',
    parameter: 'Chlorophyll-a Concentration (mg/m³)',
    source: 'Ocean Colour Monitor (OCM-3)',
  },
  coastline: {
    source: 'INCOIS Sector reference line',
  },
  waveAdvisory: {
    date: '2026-09-15',
    source: 'INCOIS High Wave/Swell Surge Advisory (incois.gov.in/site/services/hwa.jsp)',
  },
} as const;
