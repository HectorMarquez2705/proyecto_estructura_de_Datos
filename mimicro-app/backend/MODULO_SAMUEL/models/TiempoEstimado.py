from MODULO_JAVIER.models.GestorGPS import obtener_posicion
from MODULO_JAVIER.models.Parada import listar_por_ruta

try:
    import mimicro_core as _core
    _USE_CPP = True
except ImportError:
    _USE_CPP = False

VELOCIDAD_PROMEDIO_KMH = 25.0


def _haversine(lat1, lng1, lat2, lng2) -> float:
    import math
    R = 6371000.0
    dLat = math.radians(lat2 - lat1)
    dLng = math.radians(lng2 - lng1)
    a = math.sin(dLat/2)**2 + math.cos(math.radians(lat1)) * \
        math.cos(math.radians(lat2)) * math.sin(dLng/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


async def calcular_eta_micro(micro_id: int, parada_id: int) -> dict:
    pos = await obtener_posicion(micro_id)
    if not pos:
        return {"microId": micro_id, "paradaId": parada_id,
                "tiempoSegundos": None, "error": "Micro no activo"}

    from MODULO_JAVIER.models.Parada import obtener_por_id
    parada = await obtener_por_id(parada_id)
    if not parada:
        return {"microId": micro_id, "paradaId": parada_id,
                "tiempoSegundos": None, "error": "Parada no encontrada"}

    if _USE_CPP:
        pos_cpp = _core.PosicionGPS()  # type: ignore
        pos_cpp.microId   = micro_id
        pos_cpp.lat       = pos["lat"]
        pos_cpp.lng       = pos["lng"]
        pos_cpp.velocidad = pos.get("velocidad", 0.0)
        pos_cpp.timestamp = int(pos.get("timestamp", 0))

        par_cpp = _core.Parada(parada["id"], parada["nombre"],  # type: ignore
                                float(parada["lat"]), float(parada["lng"]),
                                parada["ruta_id"], parada["orden_en_ruta"])
        eta_calc = _core.TiempoEstimado()  # type: ignore
        r = eta_calc.calcularETA(pos_cpp, par_cpp, "medio")
        return {"microId": micro_id, "paradaId": parada_id,
                "distanciaMetros": r.distanciaMetros,
                "tiempoSegundos":  r.tiempoSegundos}

    dist = _haversine(pos["lat"], pos["lng"],
                      float(parada["lat"]), float(parada["lng"]))
    vel  = pos.get("velocidad", 0) or VELOCIDAD_PROMEDIO_KMH
    seg  = int((dist / 1000.0) / vel * 3600)
    return {"microId": micro_id, "paradaId": parada_id,
            "distanciaMetros": dist, "tiempoSegundos": seg}


async def calcular_etas_ruta(ruta_id: int, parada_id: int) -> list:
    from MODULO_ROBERTO.models.Micro import listar as listar_micros
    from MODULO_HECTOR.config.db import fetchall
    micros = await fetchall(
        "SELECT id FROM micros WHERE ruta_id=$1 AND estado='activo'", ruta_id
    )
    resultados = []
    for m in micros:
        eta = await calcular_eta_micro(m["id"], parada_id)
        resultados.append(eta)
    return resultados
