from fastapi import APIRouter, Depends, status
from MODULO_HECTOR.middleware.authMiddleware import get_current_user
from MODULO_BRUNO.schemas import RecargarBody
from MODULO_BRUNO.controllers.pagosController import get_tarjeta, recargar

router = APIRouter()


@router.get("/{user_id}")
async def route_get_tarjeta(user_id: int, _=Depends(get_current_user)):
    return await get_tarjeta(user_id)


@router.post("/recargar", status_code=status.HTTP_200_OK)
async def route_recargar(body: RecargarBody, usuario=Depends(get_current_user)):
    return await recargar(usuario["user_id"], body.model_dump())
