import xarray as xr, numpy as np, glob, os
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

os.makedirs("processed/chlorophyll", exist_ok=True)
files = sorted(glob.glob("chlorophyll/*.nc"))
print(f"Found {len(files)} files\n")
rows, arrays = [], []

for path in files:
    name = os.path.basename(path)
    try:
        ds = xr.open_dataset(path)
        var = next((v for v in ds.data_vars if "chl" in v.lower()), None)
        if var is None:
            print("!! no chlorophyll variable in", name, "| variables:", list(ds.data_vars)); continue
        latn = next(n for n in ds.coords if n.lower() in ("lat", "latitude"))
        lonn = next(n for n in ds.coords if n.lower() in ("lon", "longitude"))
        da = ds[var].squeeze(drop=True)
        raw_min, raw_max = float(da.min()), float(da.max())

        clean = da.where((da >= 0.01) & (da <= 50))
        note = ""
        if float(clean.notnull().mean()) == 0:
            # values may be log10 stored; try converting
            alt = 10 ** da
            alt = alt.where((alt >= 0.01) & (alt <= 50))
            if float(alt.notnull().mean()) > 0:
                clean, note = alt, "converted from log10"
        clean = clean.sortby(latn)
        clean = clean.sel({latn: slice(5, 25), lonn: slice(65, 90)})
        clean = clean.rename("chlorophyll")
        clean.attrs.update(units="mg m-3", source="ISRO EOS-06 OCM via MOSDAC", note=note)

        date = name.split("_")[1]
        date = f"{date[:4]}-{date[4:6]}-{date[6:]}"
        out = f"processed/chlorophyll/chlorophyll_{date}.nc"
        clean.to_netcdf(out, encoding={"chlorophyll": {"zlib": True, "complevel": 4}})
        valid = float(clean.notnull().mean()) * 100
        size = os.path.getsize(out) / 1024
        flag = "OK" if 5 <= valid <= 95 else "CHECK"
        rows.append((date, var, f"{raw_min:.3g}..{raw_max:.3g}", f"{valid:.1f}%", f"{size:.0f} KB", flag, note))
        arrays.append((date, clean))
    except Exception as e:
        print("!! FAILED", name, "->", repr(e))

print(f"{'date':<11}{'var':<12}{'raw range':<16}{'valid':<8}{'size':<9}{'status'}")
for r in rows:
    print(f"{r[0]:<11}{r[1]:<12}{r[2]:<16}{r[3]:<8}{r[4]:<9}{r[5]} {r[6]}")

# preview image of all days
if arrays:
    n = len(arrays); cols = 5; rws = (n + cols - 1) // cols
    fig, axs = plt.subplots(rws, cols, figsize=(3.2*cols, 3*rws), squeeze=False)
    for ax in axs.ravel(): ax.axis("off")
    for ax, (d, a) in zip(axs.ravel(), arrays):
        a.plot(ax=ax, vmin=0, vmax=3, add_colorbar=False); ax.set_title(d, fontsize=8); ax.axis("on")
    plt.tight_layout(); plt.savefig("processed/chlorophyll_preview.png", dpi=110)
    print("\nSaved processed/chlorophyll_preview.png")

# README for the team
with open("processed/DATA_README.md", "w") as f:
    f.write("# Chlorophyll (ISRO EOS-06 / Oceansat-3 OCM)\n- Source: MOSDAC, product E06OCML4AC daily 25 km\n"
            "- Region: lat 5-25, lon 65-90\n- Units: mg/m3, values outside 0.01-50 removed (NaN)\n"
            "- Gaps (NaN) are cloud or no-retrieval pixels, not zeros\n- Variable name: chlorophyll; dims: lat, lon\n"
            "- Cleaning script: clean_chl.py\n")
print("Wrote processed/DATA_README.md")
