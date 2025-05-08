import os
import json
import base64
import zlib
from datetime import datetime
import io
import cfgrib
import numpy as np
import xarray as xr
import matplotlib.pyplot as plt
from herbie import Herbie
import rioxarray
from rasterio.warp import Resampling
from scipy.interpolate import griddata

def generate_rtma_json_only(
    dt: datetime,
    variable_name: str,
    compress=True,
    downsample_factor=1,
    crop_bounds=[-116.3, 32.6, -114.7, 34.3],
    resolution=0.05,
):
    import os
    import json
    import base64
    import zlib
    import io
    import cfgrib
    import numpy as np
    import xarray as xr
    import matplotlib.pyplot as plt
    from herbie import Herbie
    import rioxarray
    from rasterio.warp import Resampling
    from scipy.interpolate import griddata

    

    timestamp = dt.strftime("%Y%m%d_%H%M")

    print(f"🔍 Downloading RTMA data for '{variable_name}'...")
    h = Herbie(dt, model="nbm", product="co", fxx=0)
    h.download()

    ds = h.xarray(
    ":var discipline=0 center=7 local_table=1 parmcat=0 parm=206:surface:24 hour fcst:nan:nan"
)
    var_key = list(ds.data_vars.keys())[0]
    da = ds[var_key]

    lat = da.latitude.values
    lon = da.longitude.values
    lon = ((lon + 180) % 360) - 180 if np.any(lon > 180) else lon
    values = da.values

    print("🧭 Interpolating to regular lat/lon grid...")
    points = np.column_stack((lon.flatten(), lat.flatten()))
    values_flat = values.flatten()
    mask = np.isfinite(values_flat) & (values_flat < 1e10)
    points = points[mask]
    values_flat = values_flat[mask]

    lon_new = np.arange(crop_bounds[0], crop_bounds[2] + resolution, resolution)
    lat_new = np.arange(crop_bounds[1], crop_bounds[3] + resolution, resolution)
    lon_grid, lat_grid = np.meshgrid(lon_new, lat_new)
    grid_values = griddata(points, values_flat, (lon_grid, lat_grid), method="nearest")

    units = "°F"

    da_grid = xr.DataArray(
        grid_values,
        coords={"latitude": lat_new, "longitude": lon_new},
        dims=["latitude", "longitude"],
        name=variable_name,
        attrs={"units": units},
    )

    print("🗺️ Reprojecting to EPSG:3857...")
    da_grid.rio.set_spatial_dims(x_dim="longitude", y_dim="latitude", inplace=True)
    da_grid.rio.write_crs("EPSG:4326", inplace=True)
    da_webmerc = da_grid.rio.reproject("EPSG:3857", resampling=Resampling.nearest)
    raw_values = da_webmerc.values

    print("🖼️ Generating in-memory PNG image...")
    flipped = np.flipud(raw_values)

    variable_cmap_config = {
        "temperature": {
            "cmap": "coolwarm",
            "transparent_when": lambda arr: np.full(arr.shape, False)
        },
        "dew_point": {
            "cmap": "PuBuGn",
            "transparent_when": lambda arr: np.full(arr.shape, False)
        },
        "precipitation": {
            "cmap": "Blues",
            "transparent_when": lambda arr: ~np.isfinite(arr) | (arr <= 0.01),
            "vmin": 0.01,
            "vmax": 5
        },
        "humidity": {
            "cmap": "YlGnBu",
            "transparent_when": lambda arr: np.full(arr.shape, False)
        },
        "cloud_cover": {
            "cmap": "Grays",
            "transparent_when": lambda arr: ~np.isfinite(arr) | (arr < 70)
        }
    }

    FIXED_RANGES = {
        "temperature_f": {"vmin": -30.0, "vmax": 105.0},  # °F
        "dew_point_f": {"vmin": -35.0, "vmax": 90.0},  # °F
        "humidity": {"vmin": 0.0, "vmax": 0.025},  # kg kg**-1
        "cloud_cover": {"vmin": 0.0, "vmax": 100.0},  # %
        "precipitation": {"vmin": 0.01, "vmax": 3.0},  # kg m**-2
    }

    config = variable_cmap_config.get(variable_name, {
        "cmap": "viridis",
        "transparent_when": lambda arr: np.full(arr.shape, False)
    })

    cmap = plt.get_cmap(config["cmap"])

    fixed_range = FIXED_RANGES.get(variable_name, {})

    norm = plt.Normalize(
        vmin=config.get("vmin", fixed_range.get("vmin", np.nanmin(flipped))),
        vmax=config.get("vmax", fixed_range.get("vmax", np.nanmax(flipped)))
)

    rgba = cmap(norm(flipped))
    alpha_mask = config["transparent_when"](flipped)
    rgba[..., 3] = np.where(alpha_mask, 0, 1)

    buffer = io.BytesIO()
    plt.imsave(buffer, rgba, format="png", origin="lower")
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
        "type": "rtma",
        "variable": variable_name,
        "units": units,
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
        "image_base64": encoded_image
    }

    if compress:
        print("🗜️ Compressing values...")
        values_str = json.dumps(json_values)
        compressed = zlib.compress(values_str.encode("utf-8"))
        b64_data = base64.b64encode(compressed).decode("ascii")
        json_data["values_compressed"] = b64_data
        json_data["compression"] = "zlib+base64"
    else:
        json_data["values"] = json_values

    print("✅ JSON único generado en memoria.")
    # 🔥 Eliminar archivo GRIB descargado tras procesarlo
    grib_path = h.get_localFilePath()
    if os.path.exists(grib_path):
        os.remove(grib_path)
    return json_data
