from MODULO_HECTOR.config.db import fetchone, fetchall, execute, fetchval


async def listar(linea_id: int) -> list:
    rows = await fetchall(
        "SELECT id, linea_id, nombre, lat, lng, orden FROM paradas_linea "
        "WHERE linea_id=$1 ORDER BY orden, id",
        linea_id,
    )
    return [
        {"id": r["id"], "linea_id": r["linea_id"], "nombre": r["nombre"],
         "lat": float(r["lat"]), "lng": float(r["lng"]), "orden": r["orden"]}
        for r in rows
    ]


async def listar_todas() -> list:
    """Devuelve todas las paradas de todas las líneas (para el algoritmo de routing)."""
    rows = await fetchall(
        "SELECT id, linea_id, nombre, lat, lng, orden FROM paradas_linea ORDER BY linea_id, orden"
    )
    return [
        {"id": r["id"], "linea_id": r["linea_id"], "nombre": r["nombre"],
         "lat": float(r["lat"]), "lng": float(r["lng"]), "orden": r["orden"]}
        for r in rows
    ]


async def crear(linea_id: int, nombre: str, lat: float, lng: float, orden: int) -> int:
    return await fetchval(
        "INSERT INTO paradas_linea (linea_id, nombre, lat, lng, orden) "
        "VALUES ($1,$2,$3,$4,$5) RETURNING id",
        linea_id, nombre, lat, lng, orden,
    )


async def eliminar(parada_id: int, linea_id: int):
    await execute(
        "DELETE FROM paradas_linea WHERE id=$1 AND linea_id=$2",
        parada_id, linea_id,
    )


async def max_orden(linea_id: int) -> int:
    val = await fetchval(
        "SELECT COALESCE(MAX(orden), 0) FROM paradas_linea WHERE linea_id=$1",
        linea_id,
    )
    return int(val)
