from fastapi import HTTPException
from MODULO_ROBERTO.models import Micro, ListaPasajeros, SensorPuerta


async def get_micros() -> list:
    return await Micro.listar()


async def get_micro(micro_id: int) -> dict:
    m = await Micro.obtener_por_id(micro_id)
    if not m:
        raise HTTPException(status_code=404, detail="Micro no encontrado")
    data = dict(m)
    data["pasajerosAbordo"] = ListaPasajeros.contar_pasajeros(micro_id)
    return data


async def crear_micro(body: dict) -> dict:
    placa     = body.get("placa", "").strip().upper()
    chofer_id = body.get("chofer_id")
    ruta_id   = body.get("ruta_id")
    capacidad = body.get("capacidad", 30)
    if not placa:
        raise HTTPException(status_code=400, detail="La placa es requerida")
    micro_id = await Micro.crear(placa, chofer_id, ruta_id, capacidad)
    return {"id": micro_id, "placa": placa}


async def patch_ocupacion(micro_id: int, body: dict) -> dict:
    estado = body.get("estado", "")
    if estado not in ("vacio", "medio", "lleno"):
        raise HTTPException(status_code=400, detail="Ocupacion invalida: debe ser vacio, medio o lleno")
    await Micro.actualizar_ocupacion(micro_id, estado)
    return {"mensaje": "Ocupacion actualizada", "estado": estado}


async def patch_estado(micro_id: int, body: dict) -> dict:
    accion = body.get("estado", "")
    if accion == "activo":
        await Micro.activar(micro_id)
    elif accion == "inactivo":
        await Micro.desactivar(micro_id)
        ListaPasajeros.limpiar_micro(micro_id)
    else:
        raise HTTPException(status_code=400, detail="Estado invalido: debe ser activo o inactivo")
    return {"mensaje": f"Micro {accion}"}
