from MODULO_HECTOR.config.db import fetchall, execute, fetchval

try:
    import mimicro_core as _core
    _USE_CPP = True
except ImportError:
    _USE_CPP = False


async def registrar_viaje(usuario_id: int, micro_id: int,
                          parada_origen_id: int, parada_destino_id: int,
                          costo: float) -> int:
    return await fetchval(
        "INSERT INTO historial_viajes "
        "(usuario_id,micro_id,parada_origen_id,parada_destino_id,costo) "
        "VALUES ($1,$2,$3,$4,$5) RETURNING id",
        usuario_id, micro_id, parada_origen_id, parada_destino_id, costo,
    )


async def obtener_historial_usuario(usuario_id: int, limite: int = 20) -> list:
    rows = await fetchall(
        """
        SELECT hv.*, r.nombre AS ruta_nombre,
               po.nombre AS parada_origen, pd.nombre AS parada_destino
        FROM historial_viajes hv
        LEFT JOIN micros m ON m.id = hv.micro_id
        LEFT JOIN rutas r  ON r.id = m.ruta_id
        LEFT JOIN paradas po ON po.id = hv.parada_origen_id
        LEFT JOIN paradas pd ON pd.id = hv.parada_destino_id
        WHERE hv.usuario_id=$1
        ORDER BY hv.fecha DESC LIMIT $2
        """,
        usuario_id, limite,
    )
    return [dict(r) for r in rows]


def construir_pila_cpp(registros: list):
    """Carga registros de BD en una PilaHistorial C++ (LIFO)."""
    if not _USE_CPP:
        return None
    pila = _core.PilaHistorial(len(registros))
    for r in reversed(registros):
        viaje = _core.RegistroViaje()
        viaje.usuarioId       = r["usuario_id"]
        viaje.microId         = r["micro_id"] or 0
        viaje.paradaOrigenId  = r["parada_origen_id"] or 0
        viaje.paradaDestinoId = r["parada_destino_id"] or 0
        viaje.fecha           = str(r["fecha"])
        viaje.costo           = float(r["costo"] or 0)
        pila.agregarViaje(viaje)
    return pila
