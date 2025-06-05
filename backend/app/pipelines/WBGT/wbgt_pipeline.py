from datetime import datetime
from herbie import Herbie
import numpy as np
import xarray as xr
from scipy.interpolate import griddata
from rasterio.enums import Resampling
import rioxarray
import base64
import zlib
import matplotlib.pyplot as plt
import json
import io
import pyproj
import os

def generate_wbgt(
        dt:datetime,
        forecast_hour: int,
        compress=True,
        downsample_factor=1,
        resolution=0.05
):
    
    timestamp = dt.strftime("%Y%m%d_%H%M")
    print(f"Downloading nbm forecast WBGT data for fxx={forecast_hour}...")

    h = Herbie(
        dt,
        model='nbm',
        product='co',
        fxx=forecast_hour
    )

    ds = h.xarray(
    f":var discipline=0 center=7 local_table=1 parmcat=0 parm=206:surface:{forecast_hour} hour fcst:nan:nan"
    )

    var_name = list(ds.data_vars.keys())[0]
    da = ds[var_name]

    lat = ds["latitude"].values
    lon = ((ds["longitude"].values + 180) % 360) - 180
    values = da.values

    print("🧭 Interpolating to regular lat/lon grid...")
    points = np.column_stack((lon.flatten(), lat.flatten()))
    values_flat = values.flatten()
    mask = np.isfinite(values_flat) & (values_flat < 1e10)
    points = points[mask]
    values_flat = values_flat[mask]

    crop_bounds=[-116.3, 32.6, -114.7, 34.3]

    lon_new = np.arange(crop_bounds[0], crop_bounds[2] + resolution, resolution)
    lat_new = np.arange(crop_bounds[1], crop_bounds[3] + resolution, resolution)
    lon_grid, lat_grid = np.meshgrid(lon_new, lat_new)

    grid_values = griddata(points, values_flat, (lon_grid, lat_grid), method="nearest")

    da_grid = xr.DataArray(
        grid_values,
        coords={"latitude": lat_new, "longitude": lon_new},
        dims=["latitude", "longitude"],
        name=var_name,
        attrs={"units": da.attrs.get("units", "")},
    )

    print("🗺️ Reprojecting to EPSG:3857...")
    da_grid.rio.set_spatial_dims(x_dim="longitude", y_dim="latitude", inplace=True)
    da_grid.rio.write_crs("EPSG:4326", inplace=True)
    da_webmerc = da_grid.rio.reproject("EPSG:3857", resampling=Resampling.nearest)
    raw_values = da_webmerc.values

    print(" Generating in-memory PNG image...")
    flipped = np.flipud(raw_values)

    vmin = float(np.nanmin(flipped))
    vmax = float(np.nanmax(flipped))
    normed = (flipped - vmin) / (vmax - vmin)
    normed = np.clip(normed, 0, 1)
    img_array = (plt.get_cmap("jet")(normed) * 255).astype(np.uint8)

    buffer = io.BytesIO()
    plt.imsave(buffer, img_array, format="png", origin="lower")
    buffer.seek(0)
    encoded_image = base64.b64encode(buffer.read()).decode("utf-8")

    json_values = (
        flipped[::downsample_factor, ::downsample_factor].tolist()
        if downsample_factor > 1
        else raw_values.tolist()
    )

    value_min = float(np.nanmin(raw_values))
    value_max = float(np.nanmax(raw_values))
    height, width = np.array(json_values).shape

    json_data = {
        "type": "nbm",
        "variable": "wbgt",
        "units": da.attrs.get("units", ""),
        "timestamp": timestamp,
        "bounds": crop_bounds,
        "lat_min": crop_bounds[1],
        "lat_max": crop_bounds[3],
        "lon_min": crop_bounds[0],
        "lon_max": crop_bounds[2],
        "shape": [height, width],
        "min": value_min,
        "max": value_max,
        "downsample_factor": downsample_factor,
        "projection": "EPSG:3857",
        "image_base64": encoded_image,
        "forecast_hour": forecast_hour,
    }

    if compress:
        print(" Compressing values...")
        values_str = json.dumps(json_values)
        compressed = zlib.compress(values_str.encode("utf-8"))
        b64_data = base64.b64encode(compressed).decode("ascii")
        json_data["values_compressed"] = b64_data
        json_data["compression"] = "zlib+base64"
    else:
        json_data["values"] = json_values

    print("✅ NBM WBGT JSON generated in memory.")
    #  Clean up local GRIB if needed
    grib_path = h.get_localFilePath()
    if os.path.exists(grib_path):
        os.remove(grib_path)

    return json_data

