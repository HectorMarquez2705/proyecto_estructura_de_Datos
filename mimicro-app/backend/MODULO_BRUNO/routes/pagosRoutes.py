from fastapi import APIRouter, Depends, Request
from MODULO_HECTOR.middleware.authMiddleware import get_current_user
from MODULO_HECTOR.middleware.rolesMiddleware import requiere_rol
from MODULO_BRUNO.controllers.pagosController import get_tarjeta, recargar

router = APIRouter()


@router.get("/{user_id}")
async def route_get_tarjeta(user_id: int, usuario=Depends(get_current_user)):
    return await get_tarjeta(user_id)


@router.post("/recargar")
async def route_recargar(request: Request, usuario=Depends(get_current_user)):
    body = await request.json()
    return await recargar(usuario["user_id"], body)
