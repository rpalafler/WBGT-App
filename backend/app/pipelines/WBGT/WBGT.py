import xarray as xr
import os

def read_wbgt_file():
    # Creamos la ruta absoluta desde la carpeta 'backend'
    filepath = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../combined_wbgt.nc"))
    
    print(f"Ruta buscada: {filepath}")  # 🔍 Debug: Comprobar ruta
    
    ds = xr.open_dataset(filepath)

    # Mostramos dimensiones y variables
    dimensions = dict(ds.dims)
    variables = list(ds.data_vars)

    # Obtenemos una muestra pequeña
    sample = {var: ds[var].isel(time=slice(0, 3)).values.tolist() for var in variables}

    ds.close()

    return {
        "dimensions": dimensions,
        "variables": variables,
        "sample_data": sample
    }


