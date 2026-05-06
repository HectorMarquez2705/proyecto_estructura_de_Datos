from fastapi import APIRouter
from MODULO_SAMUEL.controllers.etaController import get_eta, get_etas_ruta

router = APIRouter()


@router.get("/{micro_id}/{parada_id}")
async def route_eta(micro_id: int, parada_id: int):
    return await get_eta(micro_id, parada_id)


@router.get("/ruta/{ruta_id}/{parada_id}")
async def route_etas_ruta(ruta_id: int, parada_id: int):
    return await get_etas_ruta(ruta_id, parada_id)
