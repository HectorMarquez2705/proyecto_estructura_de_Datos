from fastapi import APIRouter, Depends
from MODULO_HECTOR.middleware.authMiddleware import get_current_user
from MODULO_JAVIER.controllers.gpsController import (
    get_posicion_micro, get_todas_posiciones, get_historial
)

router = APIRouter()


@router.get("/activos")
async def route_todos():
    return await get_todas_posiciones()


@router.get("/{micro_id}")
async def route_posicion(micro_id: int):
    return await get_posicion_micro(micro_id)


@router.get("/historial/{usuario_id}")
async def route_historial(usuario_id: int, usuario=Depends(get_current_user)):
    return await get_historial(usuario_id)
