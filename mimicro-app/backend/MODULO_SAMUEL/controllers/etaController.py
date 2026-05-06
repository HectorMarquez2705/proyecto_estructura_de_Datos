from MODULO_SAMUEL.models.TiempoEstimado import calcular_eta_micro, calcular_etas_ruta


async def get_eta(micro_id: int, parada_id: int) -> dict:
    return await calcular_eta_micro(micro_id, parada_id)


async def get_etas_ruta(ruta_id: int, parada_id: int) -> list:
    return await calcular_etas_ruta(ruta_id, parada_id)
