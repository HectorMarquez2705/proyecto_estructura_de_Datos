from MODULO_CRISTHIAN.models.GrafoParadas import construir_grafo_desde_db

try:
    import mimicro_core as _core
    _USE_CPP = True
except ImportError:
    _USE_CPP = False


async def ruta_optima(ruta_id: int, parada_origen: int, parada_destino: int) -> dict:
    if not _USE_CPP:
        raise RuntimeError("mimicro_core no compilado.")

    grafo = await construir_grafo_desde_db(ruta_id)
    optimizador = _core.OptimizadorRuta(grafo)
    resultado = optimizador.encontrarRutaOptima(parada_origen, parada_destino)

    return {
        "encontrado":      resultado.encontrado,
        "camino":          list(resultado.camino),
        "distanciaTotal":  resultado.distanciaTotal,
    }
