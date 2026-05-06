import os
from contextlib import asynccontextmanager
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio

from MODULO_HECTOR.config.db import init_db
from MODULO_HECTOR.config.redis_config import init_redis
from MODULO_HECTOR.config.socket_config import sio

from MODULO_BRUNO.routes.authRoutes import router as auth_router
from MODULO_BRUNO.routes.pagosRoutes import router as pagos_router
from MODULO_CRISTHIAN.routes.rutasRoutes import router as rutas_router
from MODULO_JAVIER.routes.gpsRoutes import router as gps_router
from MODULO_ROBERTO.routes.microsRoutes import router as micros_router
from MODULO_SAMUEL.routes.notifRoutes import router as notif_router
from MODULO_SAMUEL.routes.etaRoutes import router as eta_router

# Registrar handlers de Socket.IO
import MODULO_JAVIER.socket.gpsSocket  # noqa: F401  — registra eventos al importar


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    await init_redis()
    yield


app = FastAPI(title="miMicro API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:19006"), "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router,   prefix="/auth",            tags=["auth"])
app.include_router(pagos_router,  prefix="/tarjeta",         tags=["pagos"])
app.include_router(rutas_router,  prefix="/rutas",           tags=["rutas"])
app.include_router(gps_router,    prefix="/gps",             tags=["gps"])
app.include_router(micros_router, prefix="/micros",          tags=["micros"])
app.include_router(notif_router,  prefix="/notificaciones",  tags=["notificaciones"])
app.include_router(eta_router,    prefix="/eta",             tags=["eta"])


@app.get("/", tags=["health"])
async def health():
    return {"status": "ok", "app": "miMicro API"}


# Montar Socket.IO sobre la app ASGI
socket_app = socketio.ASGIApp(sio, app)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(socket_app, host="0.0.0.0", port=int(os.getenv("PORT", "3000")))
