from fastapi import FastAPI
from app.routes.WBGT_routes import router as wbgt_router



from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.encoders import jsonable_encoder
from fastapi.responses import RedirectResponse, ORJSONResponse

app = FastAPI()

# ________________________________________________________________________________
# En las lineas que vienen a continuacion, lo que hacemos es permitir que el frontend tenga acceso a sitios web
# que no son seguros (not https) porque si no hacemos esto, el frontend no podra tener acceso a la API 
# ________________________________________________________________________________
# Enable and permit Cross-Origin Resource Sharing (CORS)
origins = [
    "*"
]
# Enable Middleware in the FastAPI app that to process each request and 
# return each response using the specified pathways
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # allow_methods=["GET", "POST", "PUT", 'DELETE'],
    allow_headers=["*"],
    expose_headers=["*"],
)
# ________________________________________________________________________________



# Incluir Rutas, es decir, hemos creado una variable llamada 'app' que es en si TODO el servidor, es decir, no podremos ni
# queremos crear mas, es como si fuera un container padre. A partir de ahi, vamos añadiendo nuevas rutas, que iremos creando
# para cada metodo, por ejemplo para el procesado de datos de WBGT, el router lo encontramos en 'WBGT_router' donde definimos
# lo que se envia, como... y aqui unicamente lo incluimos para que sea accesible desde 'app' que gestiona todos los endpoints
# de nuestra API
app.include_router(wbgt_router, prefix="/api")

# Endpoint raíz para probar que el servidor funciona
@app.get("/api")
async def root():
    return {"message": "Welcome to the WBGT API"}

