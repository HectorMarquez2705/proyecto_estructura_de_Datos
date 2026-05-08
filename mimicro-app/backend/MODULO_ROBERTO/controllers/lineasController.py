from fastapi import HTTPException
from MODULO_ROBERTO.models import Linea, Micro, ParadaLinea


async def get_lineas() -> list:
    return await Linea.listar()


async def get_linea(linea_id: int) -> dict:
    l = await Linea.obtener_por_id(linea_id)
    if not l:
        raise HTTPException(status_code=404, detail="Línea no encontrada")
    l["micros"] = await Linea.listar_micros(linea_id)
    return l


async def crear_linea(body: dict) -> dict:
    nombre = body.get("nombre", "").strip()
    descripcion = body.get("descripcion", "").strip()
    ruta_path = body.get("ruta_path", [])
    if not nombre:
        raise HTTPException(status_code=400, detail="El nombre de la línea es requerido")
    if not isinstance(ruta_path, list):
        raise HTTPException(status_code=400, detail="ruta_path debe ser una lista de coordenadas")
    linea_id = await Linea.crear(nombre, descripcion, ruta_path)
    return {"id": linea_id, "nombre": nombre}


async def crear_micro_en_linea(linea_id: int, body: dict) -> dict:
    l = await Linea.obtener_por_id(linea_id)
    if not l:
        raise HTTPException(status_code=404, detail="Línea no encontrada")
    placa = body.get("placa", "").strip().upper()
    modelo = body.get("modelo", "").strip()
    descripcion = body.get("descripcion", "").strip()
    chofer_id = body.get("chofer_id")
    if not placa:
        raise HTTPException(status_code=400, detail="La placa es requerida")
    micro_id = await Micro.crear_en_linea(placa, modelo, descripcion, chofer_id, linea_id)
    return {"id": micro_id, "placa": placa}


# ── Paradas ────────────────────────────────────────────────────
async def get_paradas_linea(linea_id: int) -> list:
    return await ParadaLinea.listar(linea_id)


async def crear_parada_linea(linea_id: int, body: dict) -> dict:
    l = await Linea.obtener_por_id(linea_id)
    if not l:
        raise HTTPException(status_code=404, detail="Línea no encontrada")
    nombre = body.get("nombre", "").strip()
    lat = body.get("lat")
    lng = body.get("lng")
    if not nombre:
        raise HTTPException(status_code=400, detail="El nombre de la parada es requerido")
    if lat is None or lng is None:
        raise HTTPException(status_code=400, detail="Las coordenadas son requeridas")
    orden = await ParadaLinea.max_orden(linea_id) + 1
    parada_id = await ParadaLinea.crear(linea_id, nombre, float(lat), float(lng), orden)
    return {"id": parada_id, "nombre": nombre, "lat": lat, "lng": lng, "orden": orden}


async def eliminar_parada_linea(linea_id: int, parada_id: int):
    await ParadaLinea.eliminar(parada_id, linea_id)
