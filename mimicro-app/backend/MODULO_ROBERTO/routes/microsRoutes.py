from fastapi import APIRouter, Depends, Request
from MODULO_HECTOR.middleware.authMiddleware import get_current_user
from MODULO_HECTOR.middleware.rolesMiddleware import requiere_rol
from MODULO_ROBERTO.controllers.microsController import (
    get_micros, get_micro, crear_micro, patch_ocupacion, patch_estado
)

router = APIRouter()


@router.get("")
async def route_get_micros():
    return await get_micros()


@router.get("/{micro_id}")
async def route_get_micro(micro_id: int):
    return await get_micro(micro_id)


@router.post("")
async def route_crear_micro(request: Request, usuario=Depends(get_current_user)):
    requiere_rol("admin")(usuario)
    body = await request.json()
    return await crear_micro(body)


@router.patch("/{micro_id}/ocupacion")
async def route_patch_ocupacion(micro_id: int, request: Request,
                                 usuario=Depends(get_current_user)):
    requiere_rol("chofer", "admin")(usuario)
    body = await request.json()
    return await patch_ocupacion(micro_id, body)


@router.patch("/{micro_id}/estado")
async def route_patch_estado(micro_id: int, request: Request,
                              usuario=Depends(get_current_user)):
    requiere_rol("chofer", "admin")(usuario)
    body = await request.json()
    return await patch_estado(micro_id, body)
