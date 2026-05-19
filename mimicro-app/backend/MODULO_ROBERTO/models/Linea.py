import json
from MODULO_HECTOR.config.db import fetchone, fetchall, fetchval


async def listar() -> list:
    rows = await fetchall(
        """
        SELECT l.id, l.nombre, l.descripcion, l.ruta_path, l.created_at,
               COUNT(m.id) AS total_micros
        FROM lineas l
        LEFT JOIN micros m ON m.linea_id = l.id
        GROUP BY l.id
        ORDER BY l.nombre
        """
    )
    result = []
    for r in rows:
        d = dict(r)
        if isinstance(d.get("ruta_path"), str):
            d["ruta_path"] = json.loads(d["ruta_path"])
        result.append(d)
    return result


async def obtener_por_id(linea_id: int):
    row = await fetchone(
        "SELECT id, nombre, descripcion, ruta_path, created_at FROM lineas WHERE id=$1",
        linea_id,
    )
    if not row:
        return None
    d = dict(row)
    if isinstance(d.get("ruta_path"), str):
        d["ruta_path"] = json.loads(d["ruta_path"])
    return d


async def crear(nombre: str, descripcion: str, ruta_path: list) -> int:
    return await fetchval(
        "INSERT INTO lineas (nombre, descripcion, ruta_path) VALUES ($1, $2, $3::jsonb) RETURNING id",
        nombre, descripcion, json.dumps(ruta_path),
    )


async def listar_para_routing() -> list:
    """Solo id, nombre y ruta_path — para el algoritmo de planificación."""
    rows = await fetchall("SELECT id, nombre, ruta_path FROM lineas ORDER BY id")
    result = []
    for r in rows:
        d = dict(r)
        if isinstance(d.get("ruta_path"), str):
            d["ruta_path"] = json.loads(d["ruta_path"])
        elif d.get("ruta_path") is None:
            d["ruta_path"] = []
        result.append(d)
    return result


async def eliminar(linea_id: int):
    await fetchval("DELETE FROM lineas WHERE id=$1 RETURNING id", linea_id)


async def actualizar_ruta(linea_id: int, ruta_path: list):
    await fetchval(
        "UPDATE lineas SET ruta_path=$1::jsonb WHERE id=$2 RETURNING id",
        json.dumps(ruta_path), linea_id,
    )


async def listar_micros(linea_id: int) -> list:
    rows = await fetchall(
        """
        SELECT m.id, m.placa, m.modelo, m.descripcion, m.estado, m.ocupacion_estado,
               m.chofer_id, u.nombre AS chofer_nombre
        FROM micros m
        LEFT JOIN usuarios u ON u.id = m.chofer_id
        WHERE m.linea_id = $1
        ORDER BY m.placa
        """,
        linea_id,
    )
    return [dict(r) for r in rows]
