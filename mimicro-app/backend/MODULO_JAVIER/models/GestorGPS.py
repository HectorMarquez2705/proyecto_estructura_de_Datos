import json
from MODULO_HECTOR.config.redis_config import get_redis

GPS_TTL = 30  # segundos


async def actualizar_posicion(micro_id: int, lat: float, lng: float,
                               velocidad: float = 0.0, linea_id: int = None) -> None:
    redis = get_redis()
    data = {"microId": micro_id, "lat": lat, "lng": lng,
            "velocidad": velocidad, "timestamp": __import__("time").time()}
    if linea_id is not None:
        data["linea_id"] = linea_id
    await redis.setex(f"gps:micro:{micro_id}", GPS_TTL, json.dumps(data))


async def obtener_posicion(micro_id: int) -> dict | None:
    redis = get_redis()
    raw = await redis.get(f"gps:micro:{micro_id}")
    return json.loads(raw) if raw else None


async def eliminar_posicion(micro_id: int) -> None:
    redis = get_redis()
    await redis.delete(f"gps:micro:{micro_id}")


async def obtener_todas_posiciones() -> list:
    redis = get_redis()
    keys = await redis.keys("gps:micro:*")
    if not keys:
        return []
    valores = await redis.mget(*keys)
    return [json.loads(v) for v in valores if v]
