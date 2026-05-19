from fastapi import APIRouter, Depends, status
from MODULO_HECTOR.middleware.rolesMiddleware import requiere_rol
from MODULO_ROBERTO.schemas import (
    CrearLineaBody, CrearMicroEnLineaBody, CrearParadaLineaBody, ActualizarRutaBody,
)
from MODULO_ROBERTO.controllers.lineasController import (
    get_lineas, get_linea, crear_linea, crear_micro_en_linea,
    get_paradas_linea, crear_parada_linea, eliminar_parada_linea,
    eliminar_linea, actualizar_ruta_linea,
)

router = APIRouter()


@router.get("", dependencies=[Depends(requiere_rol("admin"))])
async def route_get_lineas():
    return await get_lineas()


@router.post("", status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(requiere_rol("admin"))])
async def route_crear_linea(body: CrearLineaBody):
    return await crear_linea(body.model_dump())


@router.get("/{linea_id}", dependencies=[Depends(requiere_rol("admin"))])
async def route_get_linea(linea_id: int):
    return await get_linea(linea_id)


@router.post("/{linea_id}/micros", status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(requiere_rol("admin"))])
async def route_crear_micro_en_linea(linea_id: int, body: CrearMicroEnLineaBody):
    return await crear_micro_en_linea(linea_id, body.model_dump())


# ── Paradas por línea ──────────────────────────────────────────
@router.get("/{linea_id}/paradas", dependencies=[Depends(requiere_rol("admin"))])
async def route_get_paradas(linea_id: int):
    return await get_paradas_linea(linea_id)


@router.post("/{linea_id}/paradas", status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(requiere_rol("admin"))])
async def route_crear_parada(linea_id: int, body: CrearParadaLineaBody):
    return await crear_parada_linea(linea_id, body.model_dump())


@router.delete("/{linea_id}/paradas/{parada_id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(requiere_rol("admin"))])
async def route_eliminar_parada(linea_id: int, parada_id: int):
    await eliminar_parada_linea(linea_id, parada_id)


@router.delete("/{linea_id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(requiere_rol("admin"))])
async def route_eliminar_linea(linea_id: int):
    await eliminar_linea(linea_id)


@router.patch("/{linea_id}/ruta", dependencies=[Depends(requiere_rol("admin"))])
async def route_actualizar_ruta(linea_id: int, body: ActualizarRutaBody):
    return await actualizar_ruta_linea(linea_id, body.ruta_path)
