from MODULO_HECTOR.config.db import fetchall, fetchval

async def get_estadisticas_generales() -> dict:
    total_usuarios = await fetchval("SELECT COUNT(*) FROM usuarios")
    total_micros   = await fetchval("SELECT COUNT(*) FROM micros")
    micros_activos = await fetchval("SELECT COUNT(*) FROM micros WHERE estado='activo'")
    total_viajes   = await fetchval("SELECT COUNT(*) FROM historial_viajes")
    rutas_activas  = await fetchval("SELECT COUNT(*) FROM rutas WHERE activa=TRUE")
    return {
        "totalUsuarios": total_usuarios,
        "totalMicros":   total_micros,
        "microsActivos": micros_activos,
        "totalViajes":   total_viajes,
        "rutasActivas":  rutas_activas,
    }

async def get_viajes_por_hora() -> list:
    rows = await fetchall("""
        SELECT EXTRACT(HOUR FROM fecha)::int AS hora, COUNT(*) AS cantidad
        FROM historial_viajes
        WHERE fecha >= NOW() - INTERVAL '24 hours'
        GROUP BY hora ORDER BY hora
    """)
    return [{"hora": r["hora"], "cantidad": r["cantidad"]} for r in rows]

async def get_viajes_por_ruta() -> list:
    rows = await fetchall("""
        SELECT r.nombre, COUNT(hv.id) AS cantidad
        FROM rutas r
        LEFT JOIN micros m ON m.ruta_id = r.id
        LEFT JOIN historial_viajes hv ON hv.micro_id = m.id
        GROUP BY r.id, r.nombre ORDER BY cantidad DESC
    """)
    return [{"ruta": r["nombre"], "cantidad": r["cantidad"]} for r in rows]
