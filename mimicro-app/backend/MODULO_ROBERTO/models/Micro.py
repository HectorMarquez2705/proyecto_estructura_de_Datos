from MODULO_HECTOR.config.db import fetchone, fetchall, execute, fetchval


async def listar() -> list:
    rows = await fetchall(
        """
        SELECT m.*, u.nombre AS chofer_nombre, r.nombre AS ruta_nombre
        FROM micros m
        LEFT JOIN usuarios u ON u.id = m.chofer_id
        LEFT JOIN rutas r    ON r.id = m.ruta_id
        ORDER BY m.id
        """
    )
    return [dict(r) for r in rows]


async def obtener_por_id(micro_id: int):
    return await fetchone("SELECT * FROM micros WHERE id=$1", micro_id)


async def crear(placa: str, chofer_id: int, ruta_id: int, capacidad: int = 30) -> int:
    return await fetchval(
        "INSERT INTO micros (placa,chofer_id,ruta_id,capacidad) "
        "VALUES ($1,$2,$3,$4) RETURNING id",
        placa, chofer_id, ruta_id, capacidad,
    )


async def crear_en_linea(placa: str, modelo: str, descripcion: str,
                          chofer_id, linea_id: int) -> int:
    return await fetchval(
        "INSERT INTO micros (placa, modelo, descripcion, chofer_id, linea_id) "
        "VALUES ($1,$2,$3,$4,$5) RETURNING id",
        placa, modelo, descripcion, chofer_id, linea_id,
    )


async def actualizar_ocupacion(micro_id: int, estado: str):
    valid = ("vacio", "medio", "lleno", "activo", "inactivo")
    if estado not in valid:
        return
    if estado in ("activo", "inactivo"):
        await execute("UPDATE micros SET estado=$1 WHERE id=$2", estado, micro_id)
    else:
        await execute("UPDATE micros SET ocupacion_estado=$1 WHERE id=$2", estado, micro_id)


async def activar(micro_id: int):
    await execute("UPDATE micros SET estado='activo' WHERE id=$1", micro_id)


async def desactivar(micro_id: int):
    await execute("UPDATE micros SET estado='inactivo' WHERE id=$1", micro_id)


async def asignar_chofer(micro_id: int, chofer_id: int):
    await execute("UPDATE micros SET chofer_id=$1 WHERE id=$2", chofer_id, micro_id)
