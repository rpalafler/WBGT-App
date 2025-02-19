# app/routes/WBGT_routes.py
from app.pipelines.WBGT.WBGT import read_wbgt_file
from fastapi import APIRouter

router = APIRouter()

# ✅ Endpoint para devolver la muestra del archivo NetCDF
@router.get("/wbgt/sample")
async def get_wbgt_sample():
    result = read_wbgt_file() 

    return result
