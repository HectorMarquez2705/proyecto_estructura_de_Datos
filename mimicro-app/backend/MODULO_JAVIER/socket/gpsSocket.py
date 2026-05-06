from MODULO_HECTOR.config.socket_config import sio
from MODULO_JAVIER.models.GestorGPS import actualizar_posicion, eliminar_posicion
from MODULO_HECTOR.config.db import fetchone


@sio.event
async def connect(sid, environ):
    pass


@sio.event
async def disconnect(sid):
    pass


@sio.on("gps_update")
async def on_gps_update(sid, data):
    micro_id  = data.get("microId")
    lat       = data.get("lat")
    lng       = data.get("lng")
    velocidad = data.get("velocidad", 0.0)

    if not micro_id or lat is None or lng is None:
        return

    await actualizar_posicion(micro_id, lat, lng, velocidad)

    micro = await fetchone("SELECT ruta_id FROM micros WHERE id=$1", micro_id)
    if micro:
        await sio.emit("micro_moved", {
            "microId":   micro_id,
            "lat":       lat,
            "lng":       lng,
            "velocidad": velocidad,
        }, room=f"ruta:{micro['ruta_id']}")


@sio.on("gps_stop")
async def on_gps_stop(sid, data):
    micro_id = data.get("microId")
    if not micro_id:
        return

    await eliminar_posicion(micro_id)

    micro = await fetchone("SELECT ruta_id FROM micros WHERE id=$1", micro_id)
    if micro:
        await sio.emit("micro_offline", {"microId": micro_id},
                       room=f"ruta:{micro['ruta_id']}")


@sio.on("join_ruta")
async def on_join_ruta(sid, data):
    ruta_id = data.get("rutaId")
    if ruta_id:
        await sio.enter_room(sid, f"ruta:{ruta_id}")


@sio.on("leave_ruta")
async def on_leave_ruta(sid, data):
    ruta_id = data.get("rutaId")
    if ruta_id:
        await sio.leave_room(sid, f"ruta:{ruta_id}")
