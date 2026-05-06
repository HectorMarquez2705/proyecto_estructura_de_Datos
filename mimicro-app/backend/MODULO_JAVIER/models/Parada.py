from MODULO_HECTOR.config.db import fetchone, fetchall, execute, fetchval


async def listar_por_ruta(ruta_id: int) -> list:
    rows = await fetchall(
        "SELECT * FROM paradas WHERE ruta_id=$1 ORDER BY orden_en_ruta", ruta_id
    )
    return [dict(r) for r in rows]


async def obtener_por_id(parada_id: int):
    return await fetchone("SELECT * FROM paradas WHERE id=$1", parada_id)


async def crear(nombre: str, lat: float, lng: float,
                ruta_id: int, orden: int) -> int:
    return await fetchval(
        "INSERT INTO paradas (nombre,lat,lng,ruta_id,orden_en_ruta) "
        "VALUES ($1,$2,$3,$4,$5) RETURNING id",
        nombre, lat, lng, ruta_id, orden,
    )


async def eliminar(parada_id: int):
    await execute("DELETE FROM paradas WHERE id=$1", parada_id)
