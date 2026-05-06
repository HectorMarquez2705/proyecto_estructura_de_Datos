from MODULO_HECTOR.config.db import fetchall

try:
    import mimicro_core as _core
    _USE_CPP = True
except ImportError:
    _USE_CPP = False


async def construir_grafo_desde_db(ruta_id: int):
    """Construye un GrafoParadas C++ con las paradas de la ruta dada."""
    if not _USE_CPP:
        raise RuntimeError("mimicro_core no compilado. Ejecuta: cd backend/cpp_core && pip install -e .")

    paradas = await fetchall(
        "SELECT * FROM paradas WHERE ruta_id=$1 ORDER BY orden_en_ruta", ruta_id
    )
    grafo = _core.GrafoParadas()
    lista = list(paradas)
    for p in lista:
        grafo.agregarParada(p["id"])
    for i in range(len(lista) - 1):
        a = lista[i]
        b = lista[i + 1]
        import math
        R = 6371000.0
        dLat = math.radians(float(b["lat"]) - float(a["lat"]))
        dLng = math.radians(float(b["lng"]) - float(a["lng"]))
        sin_a = math.sin(dLat/2)**2 + math.cos(math.radians(float(a["lat"]))) * \
                math.cos(math.radians(float(b["lat"]))) * math.sin(dLng/2)**2
        dist = R * 2 * math.atan2(math.sqrt(sin_a), math.sqrt(1 - sin_a))
        grafo.agregarArista(a["id"], b["id"], dist)
    return grafo
