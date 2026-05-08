from fastapi import APIRouter, Depends, status
from MODULO_HECTOR.middleware.authMiddleware import get_current_user
from MODULO_HECTOR.middleware.rolesMiddleware import requiere_rol
from MODULO_ROBERTO.schemas import CrearMicroBody, PatchOcupacionBody, PatchEstadoBody
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


@router.post("", status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(requiere_rol("admin"))])
async def route_crear_micro(body: CrearMicroBody):
    return await crear_micro(body.model_dump())


@router.patch("/{micro_id}/ocupacion",
              dependencies=[Depends(requiere_rol("chofer", "admin"))])
async def route_patch_ocupacion(micro_id: int, body: PatchOcupacionBody):
    return await patch_ocupacion(micro_id, body.model_dump())


@router.patch("/{micro_id}/estado",
              dependencies=[Depends(requiere_rol("chofer", "admin"))])
async def route_patch_estado(micro_id: int, body: PatchEstadoBody):
    return await patch_estado(micro_id, body.model_dump())
