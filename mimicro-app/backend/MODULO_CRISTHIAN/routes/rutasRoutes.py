from fastapi import APIRouter, Depends, status
from MODULO_HECTOR.middleware.rolesMiddleware import requiere_rol
from MODULO_CRISTHIAN.schemas import CrearRutaBody, ActualizarRutaBody
from MODULO_CRISTHIAN.controllers.rutasController import (
    get_rutas, get_ruta, get_paradas_ruta,
    crear_ruta, actualizar_ruta, desactivar_ruta, get_ruta_optima,
)

router = APIRouter()


@router.get("")
async def route_get_rutas():
    return await get_rutas()


@router.get("/{ruta_id}")
async def route_get_ruta(ruta_id: int):
    return await get_ruta(ruta_id)


@router.get("/{ruta_id}/paradas")
async def route_get_paradas(ruta_id: int):
    return await get_paradas_ruta(ruta_id)


@router.get("/{ruta_id}/optima")
async def route_ruta_optima(ruta_id: int, origen: int, destino: int):
    return await get_ruta_optima(ruta_id, origen, destino)


@router.post("", status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(requiere_rol("admin"))])
async def route_crear_ruta(body: CrearRutaBody):
    return await crear_ruta(body.model_dump())


@router.put("/{ruta_id}", dependencies=[Depends(requiere_rol("admin"))])
async def route_actualizar_ruta(ruta_id: int, body: ActualizarRutaBody):
    return await actualizar_ruta(ruta_id, body.model_dump())


@router.delete("/{ruta_id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(requiere_rol("admin"))])
async def route_desactivar_ruta(ruta_id: int):
    await desactivar_ruta(ruta_id)
