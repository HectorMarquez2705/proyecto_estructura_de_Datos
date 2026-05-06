from fastapi import HTTPException
from MODULO_SAMUEL.models import NotificacionAlerta
from MODULO_SAMUEL.models.ColaEspera import estado_paradas
from MODULO_HECTOR.config.db import fetchall


async def get_notificaciones(usuario_id: int) -> list:
    return await NotificacionAlerta.obtener_para_usuario(usuario_id)


async def crear_notificacion(body: dict) -> dict:
    usuario_id = body.get("usuarioId")
    mensaje    = body.get("mensaje", "").strip()
    tipo       = body.get("tipo", "info")
    if not usuario_id or not mensaje:
        raise HTTPException(status_code=400, detail="usuarioId y mensaje requeridos")
    nid = await NotificacionAlerta.crear(usuario_id, mensaje, tipo)
    return {"id": nid}


async def marcar_leida(notif_id: int) -> dict:
    await NotificacionAlerta.marcar_leida(notif_id)
    return {"mensaje": "Notificacion marcada como leida"}


async def marcar_todas_leidas(usuario_id: int) -> dict:
    await NotificacionAlerta.marcar_todas_leidas(usuario_id)
    return {"mensaje": "Todas marcadas como leidas"}


async def reportar_desvio(body: dict, usuario: dict) -> dict:
    descripcion = body.get("descripcion", "").strip()
    ruta_id     = body.get("rutaId")
    if not descripcion or not ruta_id:
        raise HTTPException(status_code=400, detail="descripcion y rutaId requeridos")
    pasajeros = await fetchall(
        """
        SELECT DISTINCT hv.usuario_id
        FROM historial_viajes hv
        JOIN micros m ON m.id = hv.micro_id
        WHERE m.ruta_id=$1
          AND hv.fecha >= NOW() - INTERVAL '2 hours'
        """,
        ruta_id,
    )
    ids = [r["usuario_id"] for r in pasajeros]
    await NotificacionAlerta.crear_masiva(ids, f"Desvio reportado: {descripcion}", "desvio")
    return {"mensaje": f"Alerta enviada a {len(ids)} pasajeros"}


async def get_cola_paradas(ruta_id: int) -> list:
    paradas = await fetchall(
        "SELECT id FROM paradas WHERE ruta_id=$1", ruta_id
    )
    ids = [r["id"] for r in paradas]
    return estado_paradas(ids)
