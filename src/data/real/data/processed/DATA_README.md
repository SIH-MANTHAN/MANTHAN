# Chlorophyll (ISRO EOS-06 / Oceansat-3 OCM)
- Source: MOSDAC, product E06OCML4AC daily 25 km
- Region: lat 5-25, lon 65-90
- Units: mg/m3, values outside 0.01-50 removed (NaN)
- Gaps (NaN) are cloud or no-retrieval pixels, not zeros
- Variable name: chlorophyll; dims: lat, lon
- Cleaning script: clean_chl.py

# SST (ISRO INSAT-3DR/3DS Imager L2B)
- Source: MOSDAC, 3RIMG L2B SST scans (30 min)
- Daily mean of all scans, regridded to the chlorophyll 0.25 degree grid
- Units: degC; values outside 5-40 removed (NaN); variable name: sst
- Script: clean_sst.py
