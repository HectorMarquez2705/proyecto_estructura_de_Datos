from MODULO_HECTOR.config.db import fetchone, fetchall, execute, fetchval


async def crear(usuario_id: int, mensaje: str, tipo: str) -> int:
    return await fetchval(
        "INSERT INTO notificaciones (usuario_id,mensaje,tipo) "
        "VALUES ($1,$2,$3) RETURNING id",
        usuario_id, mensaje, tipo,
    )


async def crear_masiva(usuario_ids: list, mensaje: str, tipo: str):
    for uid in usuario_ids:
        await crear(uid, mensaje, tipo)


async def obtener_para_usuario(usuario_id: int, solo_no_leidas: bool = False) -> list:
    query = "SELECT * FROM notificaciones WHERE usuario_id=$1"
    if solo_no_leidas:
        query += " AND leida=FALSE"
    query += " ORDER BY created_at DESC LIMIT 50"
    rows = await fetchall(query, usuario_id)
    return [dict(r) for r in rows]


async def marcar_leida(notif_id: int) -> bool:
    await execute("UPDATE notificaciones SET leida=TRUE WHERE id=$1", notif_id)
    return True


async def marcar_todas_leidas(usuario_id: int):
    await execute(
        "UPDATE notificaciones SET leida=TRUE WHERE usuario_id=$1", usuario_id
    )


async def contar_no_leidas(usuario_id: int) -> int:
    return await fetchval(
        "SELECT COUNT(*) FROM notificaciones WHERE usuario_id=$1 AND leida=FALSE",
        usuario_id,
    )
