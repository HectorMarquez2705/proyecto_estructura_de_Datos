try:
    import mimicro_core as _core
    _USE_CPP = True
except ImportError:
    _USE_CPP = False

_colas: dict = {}


def obtener_cola(parada_id: int):
    if not _USE_CPP:
        return None
    if parada_id not in _colas:
        _colas[parada_id] = _core.ColaEspera(parada_id)  # type: ignore
    return _colas[parada_id]


def agregar_pasajero(parada_id: int, usuario_id: int,
                     ruta_id: int, timestamp: str = "") -> bool:
    cola = obtener_cola(parada_id)
    if cola is None:
        return False
    p = _core.PasajeroEspera()  # type: ignore
    p.usuarioId = usuario_id
    p.paradaId  = parada_id
    p.rutaId    = ruta_id
    p.timestamp = timestamp or __import__("datetime").datetime.utcnow().isoformat()
    cola.agregarPasajero(p)
    return True


def cantidad_esperando(parada_id: int) -> int:
    cola = obtener_cola(parada_id)
    return cola.getTamanio() if cola else 0


def atender_siguiente(parada_id: int) -> dict | None:
    cola = obtener_cola(parada_id)
    if not cola or cola.estaVacia():
        return None
    p = cola.atenderPasajero()
    return {"usuarioId": p.usuarioId, "paradaId": p.paradaId, "rutaId": p.rutaId}


def estado_paradas(parada_ids: list) -> list:
    return [{"paradaId": pid, "esperando": cantidad_esperando(pid)}
            for pid in parada_ids]
