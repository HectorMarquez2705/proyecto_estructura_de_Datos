from fastapi import APIRouter, Depends, Request
from MODULO_HECTOR.middleware.authMiddleware import get_current_user
from MODULO_SAMUEL.controllers.notifController import (
    get_notificaciones, crear_notificacion, marcar_leida,
    marcar_todas_leidas, reportar_desvio, get_cola_paradas,
)

router = APIRouter()


@router.get("/{usuario_id}")
async def route_get_notif(usuario_id: int, usuario=Depends(get_current_user)):
    return await get_notificaciones(usuario_id)


@router.post("")
async def route_crear(request: Request, usuario=Depends(get_current_user)):
    body = await request.json()
    return await crear_notificacion(body)


@router.patch("/{notif_id}/leida")
async def route_marcar_leida(notif_id: int, usuario=Depends(get_current_user)):
    return await marcar_leida(notif_id)


@router.patch("/todas/{usuario_id}/leidas")
async def route_marcar_todas(usuario_id: int, usuario=Depends(get_current_user)):
    return await marcar_todas_leidas(usuario_id)


@router.post("/desvio")
async def route_desvio(request: Request, usuario=Depends(get_current_user)):
    body = await request.json()
    return await reportar_desvio(body, usuario)


@router.get("/cola/{ruta_id}")
async def route_cola(ruta_id: int, usuario=Depends(get_current_user)):
    return await get_cola_paradas(ruta_id)
