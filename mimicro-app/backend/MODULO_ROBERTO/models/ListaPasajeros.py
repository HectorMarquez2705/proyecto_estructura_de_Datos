try:
    import mimicro_core as _core
    _USE_CPP = True
except ImportError:
    _USE_CPP = False

# Instancias en memoria por micro (vida del proceso)
_listas: dict = {}


def obtener_lista(micro_id: int):
    if not _USE_CPP:
        return None
    if micro_id not in _listas:
        _listas[micro_id] = _core.ListaPasajeros()  # type: ignore
    return _listas[micro_id]


def agregar_pasajero(micro_id: int, usuario_id: int,
                     nombre: str, parada_origen: int) -> bool:
    lista = obtener_lista(micro_id)
    if lista is None:
        return False
    lista.agregarPasajero(usuario_id, nombre, parada_origen)
    return True


def eliminar_pasajero(micro_id: int, usuario_id: int) -> bool:
    lista = obtener_lista(micro_id)
    if lista is None:
        return False
    return lista.eliminarPasajero(usuario_id)


def contar_pasajeros(micro_id: int) -> int:
    lista = obtener_lista(micro_id)
    if lista is None:
        return 0
    return lista.getTamanio()


def limpiar_micro(micro_id: int):
    if micro_id in _listas:
        _listas[micro_id].limpiar()
