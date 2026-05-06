from MODULO_HECTOR.config.db import fetchone, fetchall, execute, fetchval


async def listar() -> list:
    rows = await fetchall("SELECT * FROM rutas WHERE activa=TRUE ORDER BY id")
    return [dict(r) for r in rows]


async def obtener_por_id(ruta_id: int):
    return await fetchone("SELECT * FROM rutas WHERE id=$1", ruta_id)


async def crear(nombre: str, descripcion: str = "") -> int:
    return await fetchval(
        "INSERT INTO rutas (nombre,descripcion) VALUES ($1,$2) RETURNING id",
        nombre, descripcion,
    )


async def actualizar(ruta_id: int, nombre: str, descripcion: str):
    await execute(
        "UPDATE rutas SET nombre=$1, descripcion=$2 WHERE id=$3",
        nombre, descripcion, ruta_id,
    )


async def desactivar(ruta_id: int):
    await execute("UPDATE rutas SET activa=FALSE WHERE id=$1", ruta_id)


async def paradas_de_ruta(ruta_id: int) -> list:
    rows = await fetchall(
        "SELECT * FROM paradas WHERE ruta_id=$1 ORDER BY orden_en_ruta",
        ruta_id,
    )
    return [dict(r) for r in rows]
