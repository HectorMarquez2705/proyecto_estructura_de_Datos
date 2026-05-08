import json
import math
from fastapi import APIRouter
from pydantic import BaseModel
from MODULO_ROBERTO.models import Linea
from MODULO_HECTOR.config.redis_config import get_redis
from MODULO_CRISTHIAN.routing.planificador import planificar, haversine

router = APIRouter()


class PlanificarBody(BaseModel):
    origen_lat: float
    origen_lng: float
    destino_lat: float
    destino_lng: float


@router.post("/planificar")
async def route_planificar(body: PlanificarBody):
    # Obtener todas las líneas con sus rutas dibujadas
    lineas = await Linea.listar_para_routing()

    resultado = planificar(
        {"lat": body.origen_lat, "lng": body.origen_lng},
        {"lat": body.destino_lat, "lng": body.destino_lng},
        lineas,
    )

    if not resultado["encontrado"]:
        return resultado

    # Enriquecer cada tramo micro con micro activo más cercano (Redis)
    redis = get_redis()
    for tramo in resultado["tramos"]:
        if tramo["tipo"] != "micro" or not tramo["linea_id"]:
            continue
        tramo["micro_cercano"] = await _micro_cercano(
            tramo["linea_id"], body.origen_lat, body.origen_lng, redis
        )

    return resultado


async def _micro_cercano(linea_id: int, origen_lat: float, origen_lng: float, redis) -> dict | None:
    """Busca en Redis el micro activo de la línea más cercano al pasajero."""
    if redis is None:
        return None
    try:
        keys = await redis.keys("gps:micro:*")
        mejor = None
        mejor_dist = math.inf
        for key in keys:
            raw = await redis.get(key)
            if not raw:
                continue
            data = json.loads(raw)
            if data.get("linea_id") != linea_id:
                continue
            mlat, mlng = data.get("lat"), data.get("lng")
            if mlat is None or mlng is None:
                continue
            dist = haversine(origen_lat, origen_lng, mlat, mlng)
            if dist < mejor_dist:
                mejor_dist = dist
                vel = data.get("velocidad") or (20_000 / 3600)
                eta_seg = dist / vel if vel > 0 else dist / (20_000 / 3600)
                mejor = {
                    "micro_id": key.split(":")[-1],
                    "lat": mlat, "lng": mlng,
                    "distancia_m": round(dist),
                    "eta_seg": round(eta_seg),
                }
        return mejor
    except Exception:
        return None
