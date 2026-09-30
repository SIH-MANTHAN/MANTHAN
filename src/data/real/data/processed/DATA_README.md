# Processed data: 16-30 March 2026

Region: latitude 5 to 25 N, longitude 65 to 90 E (Arabian Sea and Bay of Bengal).
Raw satellite files are not in this repo. Only the cleaned daily files are.

## Layers
| Folder / file | Source | Format | Days |
|---|---|---|---|
| processed/sst/ | SST daily means from the scene files | one .nc per day | 15 (16-30 Mar) |
| processed/chlorophyll/ | Oceansat-3 OCM chlorophyll L4, 25 km | one .nc per day | 13 (18 and 27 Mar missing) |
| processed/wind/ | EOS-06 scatterometer L2B, 12 km | one .nc per day | 15 (16-30 Mar) |
| processed/waves/waves_swh_tracks.csv | SARAL/AltiKa altimeter | CSV of track points | 15 days, 6,197 points |

## Notes for using the data
- Wind files use the same lat/lon grid as SST (83 lat x 101 lon). Variables: wind_speed (m/s, daily mean) and n_obs (number of observations per cell).
- Wind coverage is partial (about 42 to 59% of cells per day), because each day only has the satellite swaths that passed over. Empty cells are NaN.
- Wind cleaning: quality flag 1 only, fill values removed, speeds between 0 and 25 m/s kept. The 0.01 scale factor was inferred from the value ranges, because the file metadata does not state it.
- Waves are values along thin satellite tracks, not a map. Columns: date, time_utc, lat, lon, swh_m (significant wave height), wind_speed_alt_ms. Cleaning: inside the region, ice flag 0, wave height between 0.1 and 8 m. Use them for validation, not as a gridded layer.
- Chlorophyll is missing on 18 and 27 March, so code should not assume every layer exists for every day.
- SST from 24 March onward rests on fewer scans (15 to 22 instead of about 45), so those days can be slightly noisier.

## Scripts
scripts/clean_sst.py, clean_chl.py, clean_wind.py, clean_waves.py
