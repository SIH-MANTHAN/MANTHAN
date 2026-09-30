import glob, os
import numpy as np
import pandas as pd
import xarray as xr
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

LAT_MIN, LAT_MAX = 5.0, 25.0
LON_MIN, LON_MAX = 65.0, 90.0
base = np.datetime64("2000-01-01T00:00:00")

files = sorted(glob.glob("waves/**/*.nc", recursive=True))
print("Wave files:", len(files))
frames = []
for p in files:
    ds = xr.open_dataset(p, decode_times=False)
    lat = ds["lat"].values.astype("float64")
    lon = ds["lon"].values.astype("float64")
    swh = ds["swh"].values.astype("float64")
    ws = ds["wind_speed_alt"].values.astype("float64")
    ice = ds["ice_flag"].values
    t = ds["time"].values.astype("float64")
    ds.close()
    ok = (lat >= LAT_MIN) & (lat <= LAT_MAX) & (lon >= LON_MIN) & (lon <= LON_MAX)
    ok &= np.isfinite(swh) & (swh > 0.1) & (swh < 8) & (ice == 0) & np.isfinite(t)
    if not ok.any():
        continue
    dt = base + (t[ok] * 1000).astype("int64").astype("timedelta64[ms]")
    frames.append(pd.DataFrame({
        "date": dt.astype("datetime64[D]").astype(str),
        "time_utc": dt.astype("datetime64[s]").astype(str),
        "lat": lat[ok], "lon": lon[ok],
        "swh_m": swh[ok], "wind_speed_alt_ms": ws[ok],
    }))

if not frames:
    print("No wave points found inside the region")
else:
    df = pd.concat(frames, ignore_index=True).sort_values("time_utc")
    os.makedirs("processed/waves", exist_ok=True)
    df.to_csv("processed/waves/waves_swh_tracks.csv", index=False)
    print("Saved processed/waves/waves_swh_tracks.csv with", len(df), "points")
    print()
    print("date        points   min    mean   max  (swh, m)")
    for d, g in df.groupby("date"):
        print(d, "  %5d" % len(g), "  %4.2f  %4.2f  %5.2f" % (g.swh_m.min(), g.swh_m.mean(), g.swh_m.max()))
    fig, ax = plt.subplots(figsize=(6, 5))
    sc = ax.scatter(df.lon, df.lat, c=df.swh_m, s=3)
    fig.colorbar(sc, label="SWH (m)")
    ax.set_title("SARAL wave height along tracks")
    fig.savefig("processed/waves_preview.png", dpi=100)
    print("Saved processed/waves_preview.png")
