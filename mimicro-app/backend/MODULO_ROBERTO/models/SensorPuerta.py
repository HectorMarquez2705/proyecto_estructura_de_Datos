try:
    import mimicro_core as _core
    _USE_CPP = True
except ImportError:
    _USE_CPP = False

_sensores: dict = {}


def obtener_sensor(micro_id: int):
    if not _USE_CPP:
        return None
    if micro_id not in _sensores:
        _sensores[micro_id] = _core.SensorPuerta(micro_id)  # type: ignore
    return _sensores[micro_id]


def abrir_puerta(micro_id: int):
    s = obtener_sensor(micro_id)
    if s:
        s.abrirPuerta()


def cerrar_puerta(micro_id: int):
    s = obtener_sensor(micro_id)
    if s:
        s.cerrarPuerta()


def registrar_entrada(micro_id: int) -> bool:
    s = obtener_sensor(micro_id)
    return s.registrarEntrada() if s else False


def registrar_salida(micro_id: int) -> bool:
    s = obtener_sensor(micro_id)
    return s.registrarSalida() if s else False


def pasajeros_netos(micro_id: int) -> int:
    s = obtener_sensor(micro_id)
    return s.getPasajerosNetos() if s else 0
