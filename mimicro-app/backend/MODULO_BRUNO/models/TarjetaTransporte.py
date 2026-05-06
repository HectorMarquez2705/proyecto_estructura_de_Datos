import uuid
from MODULO_HECTOR.config.db import fetchone, fetchall, execute, fetchval


async def crear_tarjeta(usuario_id: int) -> int:
    numero = "TC-" + str(uuid.uuid4())[:8].upper()
    return await fetchval(
        "INSERT INTO tarjetas_transporte (usuario_id, numero_tarjeta) "
        "VALUES ($1,$2) RETURNING id",
        usuario_id, numero,
    )


async def obtener_por_usuario(usuario_id: int):
    return await fetchone(
        "SELECT * FROM tarjetas_transporte WHERE usuario_id=$1 AND activa=TRUE",
        usuario_id,
    )


async def obtener_por_id(tarjeta_id: int):
    return await fetchone(
        "SELECT * FROM tarjetas_transporte WHERE id=$1", tarjeta_id
    )


async def recargar(tarjeta_id: int, monto: float) -> bool:
    tarjeta = await obtener_por_id(tarjeta_id)
    if not tarjeta or not tarjeta["activa"]:
        return False
    await execute(
        "UPDATE tarjetas_transporte SET saldo=saldo+$1 WHERE id=$2",
        monto, tarjeta_id,
    )
    await execute(
        "INSERT INTO transacciones (tarjeta_id,monto,tipo,descripcion) "
        "VALUES ($1,$2,'recarga','Recarga de saldo')",
        tarjeta_id, monto,
    )
    return True


async def cobrar(tarjeta_id: int, monto: float) -> bool:
    tarjeta = await obtener_por_id(tarjeta_id)
    if not tarjeta or not tarjeta["activa"] or tarjeta["saldo"] < monto:
        return False
    await execute(
        "UPDATE tarjetas_transporte SET saldo=saldo-$1 WHERE id=$2",
        monto, tarjeta_id,
    )
    await execute(
        "INSERT INTO transacciones (tarjeta_id,monto,tipo,descripcion) "
        "VALUES ($1,$2,'cobro','Cobro de pasaje')",
        tarjeta_id, monto,
    )
    return True


async def historial(tarjeta_id: int, limite: int = 5):
    return await fetchall(
        "SELECT * FROM transacciones WHERE tarjeta_id=$1 "
        "ORDER BY created_at DESC LIMIT $2",
        tarjeta_id, limite,
    )
