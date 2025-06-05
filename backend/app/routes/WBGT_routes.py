from fastapi import APIRouter, HTTPException
from datetime import datetime
from app.pipelines.WBGT.wbgt_pipeline import generate_wbgt  # 👈 Importa la función
import time

router = APIRouter()

@router.get("/wbgt/{datetime_str}/{forecast_hour}")
async def get_wbgt_data(datetime_str: str, forecast_hour: int):
    try:
        # ⏱️ Medir tiempo
        start_time = time.time()

        # Convertir string a datetime
        dt = datetime.strptime(datetime_str, "%Y-%m-%d_%H")

        # Llamar a tu función
        result = generate_wbgt(dt, forecast_hour)

        end_time = time.time()
        print(f"⏱️ Tiempo de respuesta total: {end_time - start_time:.2f} segundos")

        return result

    except ValueError:
        raise HTTPException(status_code=400, detail="❌ Formato de fecha inválido. Usa YYYY-MM-DD_HH")
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="❌ Archivo WBGT no encontrado.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"❌ Error interno: {str(e)}")
