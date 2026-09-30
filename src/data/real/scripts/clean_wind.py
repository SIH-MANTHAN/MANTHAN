import glob, os
import numpy as np
import h5py
import xarray as xr
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

LAT_MIN, LAT_MAX = 5.0, 25.0
LON_MIN, LON_MAX = 65.0, 90.0
KEEP_FLAGS = [1]     # quality flags to keep (strict)
SCALE = 0.01         # inferred, check the printed ranges

lat_g = lon_g = None
try:
    ref = xr.open_dataset("processed/sst/sst_2026-03-16.nc")
    lat_g = np.asarray(ref["lat"].values, dtype="float64")
    lon_g = np.asarray(ref["lon"].values, dtype="float64")
    ref.close()
    print("Using SST grid:", lat_g.size, "x", lon_g.size)
except Exception as e:
    print("Could not read SST grid:", e)
if lat_g is None or lat_g.ndim != 1 or lon_g.ndim != 1 or lat_g.size < 2 or lon_g.size < 2:
    lat_g = np.arange(LAT_MIN, LAT_MAX + 0.001, 0.25)
    lon_g = np.arange(LON_MIN, LON_MAX + 0.001, 0.25)
    print("Using fallback 0.25 degree grid")
nlat, nlon = lat_g.size, lon_g.size
dlat = lat_g[1] - lat_g[0]
dlon = lon_g[1] - lon_g[0]

def row_days(times):
    out = []
    for t in times:
        s = t.decode() if isinstance(t, bytes) else str(t)
        year, doy = int(s[0:4]), int(s[5:8])
        out.append(np.datetime64(str(year) + "-01-01") + np.timedelta64(doy - 1, "D"))
    return np.array(out)

sums, counts = {}, {}
files = sorted(glob.glob("wind/**/*.h5", recursive=True))
print("Wind files:", len(files))
for i, p in enumerate(files):
    with h5py.File(p, "r") as f:
        g = f["science_data"]
        lat = g["Latitude"][:].astype("float64")
        lon = g["Longitude"][:].astype("float64")
        spd = g["Wind_speed_selection"][:].astype("float64")
        flg = g["WVC_quality_flag"][:]
        rt = g["WVC_row_time"][0]
    days = row_days(rt)
    days2d = np.repeat(days[:, None], lat.shape[1], axis=1)
    bad = (lat == 32767) | (lon == 65535) | (spd == 32767)
    lat = lat * SCALE
    lon = lon * SCALE
    spd = spd * SCALE
    if i == 0:
        good = ~bad
        print("First file, converted ranges: lat", lat[good].min(), lat[good].max(),
              "lon", lon[good].min(), lon[good].max(),
              "speed", spd[good].min(), spd[good].max())
    ok = ~bad & np.isin(flg, KEEP_FLAGS) & (spd > 0) & (spd < 25)
    ok &= (lat >= LAT_MIN) & (lat <= LAT_MAX) & (lon >= LON_MIN) & (lon <= LON_MAX)
    if ok.any():
        la, lo, sp, dd = lat[ok], lon[ok], spd[ok], days2d[ok]
        ilat = np.rint((la - lat_g[0]) / dlat).astype(int)
        ilon = np.rint((lo - lon_g[0]) / dlon).astype(int)
        inside = (ilat >= 0) & (ilat < nlat) & (ilon >= 0) & (ilon < nlon)
        for d in np.unique(dd):
            m = (dd == d) & inside
            if not m.any():
                continue
            key = str(d)
            flat = ilat[m] * nlon + ilon[m]
            s = np.bincount(flat, weights=sp[m], minlength=nlat * nlon)
            c = np.bincount(flat, minlength=nlat * nlon)
            if key not in sums:
                sums[key] = np.zeros(nlat * nlon)
                counts[key] = np.zeros(nlat * nlon)
            sums[key] += s
            counts[key] += c
    if (i + 1) % 100 == 0:
        print("  processed", i + 1, "of", len(files))

os.makedirs("processed/wind", exist_ok=True)
print()
print("date        cells covered %   min    mean   max")
maps = {}
for day in sorted(sums):
    c = counts[day].reshape(nlat, nlon)
    s = sums[day].reshape(nlat, nlon)
    mean = np.where(c > 0, s / np.maximum(c, 1), np.nan).astype("float32")
    maps[day] = mean
    ds = xr.Dataset(
        {"wind_speed": (("lat", "lon"), mean, {"units": "m/s", "long_name": "daily mean wind speed"}),
         "n_obs": (("lat", "lon"), c.astype("int32"))},
        coords={"lat": lat_g, "lon": lon_g, "time": np.datetime64(day).astype("datetime64[ns]")})
    ds.to_netcdf("processed/wind/wind_" + day + ".nc")
    cov = 100.0 * (c > 0).mean()
    print(day, "  %6.1f" % cov, "     %5.1f  %5.1f  %5.1f" % (np.nanmin(mean), np.nanmean(mean), np.nanmax(mean)))

if maps:
    days_sorted = sorted(maps)
    fig, ax = plt.subplots(1, 2, figsize=(11, 4))
    ax[0].pcolormesh(lon_g, lat_g, maps[days_sorted[0]], shading="auto")
    ax[0].set_title("Wind " + days_sorted[0])
    allmean = np.nanmean(np.stack([maps[d] for d in days_sorted]), axis=0)
    im = ax[1].pcolormesh(lon_g, lat_g, allmean, shading="auto")
    ax[1].set_title("Mean of all days (m/s)")
    fig.colorbar(im, ax=ax)
    fig.savefig("processed/wind_preview.png", dpi=100)
    print("Saved processed/wind_preview.png")
