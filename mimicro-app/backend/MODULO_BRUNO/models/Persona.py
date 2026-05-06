from MODULO_HECTOR.config.db import fetchone, fetchall, execute, fetchval
from MODULO_HECTOR.utils.encriptador import hash_password, verify_password


async def crear_usuario(nombre: str, email: str, password: str,
                        rol: str, telefono: str = "") -> int:
    hashed = hash_password(password)
    return await fetchval(
        "INSERT INTO usuarios (nombre,email,password_hash,rol,telefono) "
        "VALUES ($1,$2,$3,$4,$5) RETURNING id",
        nombre, email, hashed, rol, telefono,
    )


async def obtener_por_email(email: str):
    return await fetchone("SELECT * FROM usuarios WHERE email=$1", email)


async def obtener_por_id(user_id: int):
    return await fetchone("SELECT * FROM usuarios WHERE id=$1", user_id)


async def listar_todos():
    return await fetchall(
        "SELECT id,nombre,email,rol,telefono,created_at FROM usuarios ORDER BY id"
    )


async def cambiar_rol(user_id: int, nuevo_rol: str):
    await execute("UPDATE usuarios SET rol=$1 WHERE id=$2", nuevo_rol, user_id)


async def verificar_credenciales(email: str, password: str):
    usuario = await obtener_por_email(email)
    if not usuario:
        return None
    if not verify_password(password, usuario["password_hash"]):
        return None
    return usuario
