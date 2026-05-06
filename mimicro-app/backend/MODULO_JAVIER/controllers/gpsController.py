from fastapi import HTTPException
from MODULO_JAVIER.models.GestorGPS import obtener_posicion, obtener_todas_posiciones
from MODULO_JAVIER.models.PilaHistorial import obtener_historial_usuario


async def get_posicion_micro(micro_id: int) -> dict:
    pos = await obtener_posicion(micro_id)
    if not pos:
        raise HTTPException(status_code=404, detail="Micro no activo")
    return pos


async def get_todas_posiciones() -> list:
    return await obtener_todas_posiciones()


async def get_historial(usuario_id: int) -> list:
    return await obtener_historial_usuario(usuario_id)
