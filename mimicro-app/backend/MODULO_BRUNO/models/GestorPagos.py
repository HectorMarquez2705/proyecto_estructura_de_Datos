from MODULO_HECTOR.config.db import fetchall, fetchval


async def resumen_pagos(usuario_id: int) -> dict:
    from MODULO_BRUNO.models.TarjetaTransporte import obtener_por_usuario, historial
    tarjeta = await obtener_por_usuario(usuario_id)
    if not tarjeta:
        return {"saldo": 0.0, "tarjeta": None, "ultimas_transacciones": []}
    ultimas = await historial(tarjeta["id"], 5)
    return {
        "saldo": float(tarjeta["saldo"]),
        "tarjeta": {
            "id":             tarjeta["id"],
            "numero_tarjeta": tarjeta["numero_tarjeta"],
            "activa":         tarjeta["activa"],
        },
        "ultimas_transacciones": [dict(t) for t in ultimas],
    }


async def total_recaudado_hoy() -> float:
    val = await fetchval(
        "SELECT COALESCE(SUM(monto),0) FROM transacciones "
        "WHERE tipo='cobro' AND DATE(created_at)=CURRENT_DATE"
    )
    return float(val)
