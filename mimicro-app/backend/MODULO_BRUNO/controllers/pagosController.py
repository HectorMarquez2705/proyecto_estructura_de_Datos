from fastapi import HTTPException
from MODULO_BRUNO.models import TarjetaTransporte, GestorPagos


async def get_tarjeta(usuario_id: int) -> dict:
    resumen = await GestorPagos.resumen_pagos(usuario_id)
    if not resumen["tarjeta"]:
        raise HTTPException(status_code=404, detail="Tarjeta no encontrada")
    return resumen


async def recargar(usuario_id: int, body: dict) -> dict:
    monto = body.get("monto")
    if not monto or float(monto) <= 0:
        raise HTTPException(status_code=400, detail="Monto invalido")

    tarjeta = await TarjetaTransporte.obtener_por_usuario(usuario_id)
    if not tarjeta:
        raise HTTPException(status_code=404, detail="Tarjeta no encontrada")

    ok = await TarjetaTransporte.recargar(tarjeta["id"], float(monto))
    if not ok:
        raise HTTPException(status_code=400, detail="No se pudo recargar")

    tarjeta_actualizada = await TarjetaTransporte.obtener_por_id(tarjeta["id"])
    return {"saldo": float(tarjeta_actualizada["saldo"]), "mensaje": "Recarga exitosa"}


async def cobrar_pasaje(tarjeta_id: int, monto: float) -> dict:
    ok = await TarjetaTransporte.cobrar(tarjeta_id, monto)
    if not ok:
        raise HTTPException(status_code=400, detail="Saldo insuficiente o tarjeta inactiva")
    return {"mensaje": "Cobro realizado"}
