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
    chofer_id = body.get("choferId")
    ruta_id   = body.get("rutaId")
    capacidad = body.get("capacidad", 30)
    if not placa or not chofer_id or not ruta_id:
        raise HTTPException(status_code=400, detail="placa, choferId y rutaId son requeridos")
    micro_id = await Micro.crear(placa, chofer_id, ruta_id, capacidad)
    return {"id": micro_id, "placa": placa}


async def patch_ocupacion(micro_id: int, body: dict) -> dict:
    estado = body.get("ocupacion", "")
    if estado not in ("vacio", "medio", "lleno"):
        raise HTTPException(status_code=400, detail="Ocupacion invalida")
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
        raise HTTPException(status_code=400, detail="Estado invalido")
    return {"mensaje": f"Micro {accion}"}
