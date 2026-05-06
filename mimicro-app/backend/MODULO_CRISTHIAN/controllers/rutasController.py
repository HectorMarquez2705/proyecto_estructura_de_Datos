from fastapi import HTTPException
from MODULO_CRISTHIAN.models import Ruta, OptimizadorRuta


async def get_rutas() -> list:
    return await Ruta.listar()


async def get_ruta(ruta_id: int) -> dict:
    ruta = await Ruta.obtener_por_id(ruta_id)
    if not ruta:
        raise HTTPException(status_code=404, detail="Ruta no encontrada")
    return dict(ruta)


async def get_paradas_ruta(ruta_id: int) -> list:
    return await Ruta.paradas_de_ruta(ruta_id)


async def crear_ruta(body: dict) -> dict:
    nombre      = body.get("nombre", "").strip()
    descripcion = body.get("descripcion", "")
    if not nombre:
        raise HTTPException(status_code=400, detail="Nombre requerido")
    ruta_id = await Ruta.crear(nombre, descripcion)
    return {"id": ruta_id, "nombre": nombre}


async def actualizar_ruta(ruta_id: int, body: dict) -> dict:
    nombre      = body.get("nombre", "").strip()
    descripcion = body.get("descripcion", "")
    if not nombre:
        raise HTTPException(status_code=400, detail="Nombre requerido")
    await Ruta.actualizar(ruta_id, nombre, descripcion)
    return {"mensaje": "Ruta actualizada"}


async def desactivar_ruta(ruta_id: int) -> dict:
    await Ruta.desactivar(ruta_id)
    return {"mensaje": "Ruta desactivada"}


async def get_ruta_optima(ruta_id: int, origen: int, destino: int) -> dict:
    return await OptimizadorRuta.ruta_optima(ruta_id, origen, destino)
