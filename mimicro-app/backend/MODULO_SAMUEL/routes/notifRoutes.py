from fastapi import APIRouter, Depends, status
from MODULO_HECTOR.middleware.authMiddleware import get_current_user
from MODULO_SAMUEL.schemas import CrearNotifBody, DesvioBody
from MODULO_SAMUEL.controllers.notifController import (
    get_notificaciones, crear_notificacion, marcar_leida,
    marcar_todas_leidas, reportar_desvio, get_cola_paradas,
)

router = APIRouter()


@router.get("/cola/{ruta_id}")
async def route_cola(ruta_id: int, _=Depends(get_current_user)):
    return await get_cola_paradas(ruta_id)


@router.get("/{usuario_id}")
async def route_get_notif(usuario_id: int, _=Depends(get_current_user)):
    return await get_notificaciones(usuario_id)


@router.post("", status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(get_current_user)])
async def route_crear(body: CrearNotifBody):
    return await crear_notificacion(body.model_dump())


@router.patch("/{notif_id}/leida", dependencies=[Depends(get_current_user)])
async def route_marcar_leida(notif_id: int):
    return await marcar_leida(notif_id)


@router.patch("/todas/{usuario_id}/leidas", dependencies=[Depends(get_current_user)])
async def route_marcar_todas(usuario_id: int):
    return await marcar_todas_leidas(usuario_id)


@router.post("/desvio", status_code=status.HTTP_201_CREATED)
async def route_desvio(body: DesvioBody, usuario=Depends(get_current_user)):
    return await reportar_desvio(body.model_dump(), usuario)
