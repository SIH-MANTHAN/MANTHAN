import h5py, numpy as np, xarray as xr, glob, os, datetime as dt
from collections import defaultdict
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

files = sorted(glob.glob("sst/**/*.h5", recursive=True))
print("Found", len(files), "SST files")
if not files:
    raise SystemExit("No .h5 files found under sst/")

# ---- show structure of the first file (names and shapes only) ----
with h5py.File(files[0], "r") as f:
    print("\nSTRUCTURE OF", os.path.basename(files[0]))
    def show(n, o):
        if isinstance(o, h5py.Dataset):
            print("  ", n, o.shape, o.dtype)
    f.visititems(show)
    print("  root attrs:", {k: str(v)[:40] for k, v in list(f.attrs.items())[:25]})
print()

# ---- target grid = same as cleaned chlorophyll ----
reffile = sorted(glob.glob("processed/chlorophyll/*.nc"))[0]
ref = xr.open_dataset(reffile)
latn = next(n for n in ref.coords if n.lower() in ("lat", "latitude"))
lonn = next(n for n in ref.coords if n.lower() in ("lon", "longitude"))
tlat, tlon = ref[latn].values, ref[lonn].values
ocean = ref["chlorophyll"].notnull().values

def edges(c):
    c = np.asarray(c, float); d = np.diff(c)
    return np.concatenate([[c[0] - d[0] / 2], c[:-1] + d / 2, [c[-1] + d[-1] / 2]])
latE, lonE = edges(tlat), edges(tlon)

def geo(o):
    x = np.squeeze(o[...]).astype("float64")
    for k in ("_FillValue", "fill_value", "missing_value", "FillValue"):
        if k in o.attrs:
            x[x == float(np.array(o.attrs[k]).ravel()[0])] = np.nan
            break
    sc = None
    for k in ("scale_factor", "Scale_factor", "scale"):
        if k in o.attrs:
            sc = float(np.array(o.attrs[k]).ravel()[0])
            break
    off = float(np.array(o.attrs["add_offset"]).ravel()[0]) if "add_offset" in o.attrs else 0.0
    if sc is not None:
        x = x * sc + off
    elif np.nanmax(np.abs(x)) > 360:
        x = x / 100.0
    return x

def read_scan(path):
    with h5py.File(path, "r") as f:
        dsets = {}
        def grab(n, o):
            if isinstance(o, h5py.Dataset):
                dsets[n] = o
        f.visititems(grab)
        def last(n): return n.split("/")[-1].lower()
        sname = None
        for n, o in dsets.items():
            b = last(n)
            if "sst" in b and o.ndim >= 2 and not any(x in b for x in ("qual", "flag", "qc", "lat", "lon", "err", "unc")):
                sname = n; break
        if sname is None:
            raise ValueError("no SST dataset found")
        o = dsets[sname]
        sst = np.squeeze(o[...]).astype("float64")
        def a(*ks):
            for k in ks:
                if k in o.attrs:
                    return float(np.array(o.attrs[k]).ravel()[0])
        fill = a("_FillValue", "fill_value", "missing_value", "FillValue")
        scale = a("scale_factor", "Scale_factor", "scale")
        off = a("add_offset", "Add_offset", "offset")
        if fill is not None:
            sst[sst == fill] = np.nan
        if scale is not None and np.issubdtype(o.dtype, np.integer):
            sst = sst * scale + (off or 0)
        if np.nanmedian(sst) > 200:
            sst = sst - 273.15
        sst[(sst < 5) | (sst > 40)] = np.nan

        def find(keys):
            for n, o2 in dsets.items():
                if last(n) in keys and o2.ndim >= 1:
                    return n
        ln, gn = find(("latitude", "lat")), find(("longitude", "lon"))
        if ln and gn:
            lat = geo(dsets[ln])
            lon = geo(dsets[gn])
        else:
            R = f.attrs
            need = ("upper_latitude", "lower_latitude", "left_longitude", "right_longitude")
            if not all(k in R for k in need):
                raise ValueError("no lat/lon datasets or corner attributes found")
            up, lo, le, ri = [float(np.array(R[k]).ravel()[0]) for k in need]
            ny, nx = sst.shape
            lat, lon = np.linspace(up, lo, ny), np.linspace(le, ri, nx)
        if lat.ndim == 1 and lon.ndim == 1:
            LAT, LON = np.meshgrid(lat, lon, indexing="ij")
        else:
            LAT, LON = lat, lon
        if LAT.shape != sst.shape:
            raise ValueError(f"shape mismatch sst{sst.shape} lat{LAT.shape}")
        LAT = np.where(np.abs(LAT) <= 90, LAT, np.nan)
        LON = np.where(np.abs(LON) <= 360, LON, np.nan)
        if not np.isfinite(LAT).any():
            raise ValueError("latitude all invalid")
        return sst, LAT, LON

sums, counts, nscan = {}, {}, defaultdict(int)
errors = 0
for p in files:
    name = os.path.basename(p)
    try:
        d = dt.datetime.strptime(name.split("_")[1].title(), "%d%b%Y").strftime("%Y-%m-%d")
        sst, LAT, LON = read_scan(p)
        m = np.isfinite(sst) & np.isfinite(LAT) & np.isfinite(LON) & (LAT >= latE[0]) & (LAT <= latE[-1]) & (LON >= lonE[0]) & (LON <= lonE[-1])
        s, _, _ = np.histogram2d(LAT[m], LON[m], bins=[latE, lonE], weights=sst[m])
        c, _, _ = np.histogram2d(LAT[m], LON[m], bins=[latE, lonE])
        sums[d] = sums.get(d, 0) + s
        counts[d] = counts.get(d, 0) + c
        nscan[d] += 1
    except Exception as e:
        errors += 1
        if errors <= 3:
            print("!! FAILED", name, "->", repr(e))

os.makedirs("processed/sst", exist_ok=True)
print(f"\n{'date':<12}{'scans':<7}{'ocean covered':<15}{'min':<7}{'mean':<7}{'max':<7}status")
arrays = []
for d in sorted(sums):
    with np.errstate(invalid="ignore", divide="ignore"):
        mean = np.where(counts[d] > 0, sums[d] / counts[d], np.nan)
    da = xr.DataArray(mean, dims=(latn, lonn), coords={latn: tlat, lonn: tlon}, name="sst")
    da.attrs.update(units="degC", source="ISRO INSAT-3DR/3DS Imager L2B SST via MOSDAC", note="daily mean of all scans")
    da.to_netcdf(f"processed/sst/sst_{d}.nc", encoding={"sst": {"zlib": True, "complevel": 4}})
    cov = float((np.isfinite(mean) & ocean).sum() / ocean.sum()) * 100
    lo_, me_, hi_ = np.nanmin(mean), np.nanmean(mean), np.nanmax(mean)
    status = "OK" if cov >= 50 and 20 <= me_ <= 34 else "CHECK"
    print(f"{d:<12}{nscan[d]:<7}{cov:<15.1f}{lo_:<7.1f}{me_:<7.1f}{hi_:<7.1f}{status}")
    arrays.append((d, da))

if arrays:
    n = len(arrays); cols = 5; rws = (n + cols - 1) // cols
    fig, axs = plt.subplots(rws, cols, figsize=(3.2 * cols, 3 * rws), squeeze=False)
    for ax in axs.ravel(): ax.axis("off")
    for ax, (d, a_) in zip(axs.ravel(), arrays):
        a_.plot(ax=ax, vmin=24, vmax=32, add_colorbar=False); ax.set_title(d, fontsize=8); ax.axis("on")
    plt.tight_layout(); plt.savefig("processed/sst_preview.png", dpi=110)
    print("\nSaved processed/sst_preview.png")

with open("processed/DATA_README.md", "a") as f:
    f.write("\n# SST (ISRO INSAT-3DR/3DS Imager L2B)\n- Source: MOSDAC, 3RIMG L2B SST scans (30 min)\n"
            "- Daily mean of all scans, regridded to the chlorophyll 0.25 degree grid\n"
            "- Units: degC; values outside 5-40 removed (NaN); variable name: sst\n- Script: clean_sst.py\n")
print("Updated processed/DATA_README.md")
