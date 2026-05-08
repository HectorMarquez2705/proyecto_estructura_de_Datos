from fastapi import HTTPException, status, Request
from MODULO_BRUNO.models import Persona, TarjetaTransporte
from MODULO_HECTOR.utils.jwtHelper import crear_token
from MODULO_HECTOR.services.reporteSeguridad import log_acceso


async def login(body: dict, request: Request) -> dict:
    email    = body.get("email", "").strip().lower()
    password = body.get("password", "")
    ip       = request.client.host if request.client else "desconocida"

    usuario = await Persona.verificar_credenciales(email, password)
    if not usuario:
        log_acceso(email, ip, exitoso=False)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Credenciales invalidas")

    log_acceso(email, ip, exitoso=True)
    token = crear_token(usuario["id"], usuario["rol"], usuario["nombre"])
    return {"token": token, "rol": usuario["rol"], "nombre": usuario["nombre"]}


async def register(body: dict) -> dict:
    nombre   = body.get("nombre", "").strip()
    email    = body.get("email", "").strip().lower()
    password = body.get("password", "")
    rol      = body.get("rol", "pasajero")
    telefono = body.get("telefono", "")

    if rol not in ("pasajero", "chofer"):
        raise HTTPException(status_code=400, detail="Rol invalido. Debe ser 'pasajero' o 'chofer'")
    if not nombre or not email or not password:
        raise HTTPException(status_code=400, detail="Nombre, email y contrasena son requeridos")
    if len(password) < 6:
        raise HTTPException(status_code=400, detail="La contrasena debe tener al menos 6 caracteres")

    existing = await Persona.obtener_por_email(email)
    if existing:
        raise HTTPException(status_code=409, detail="El email ya esta registrado")

    user_id = await Persona.crear_usuario(nombre, email, password, rol, telefono)
    await TarjetaTransporte.crear_tarjeta(user_id)
    token = crear_token(user_id, rol, nombre)
    return {"token": token, "rol": rol, "nombre": nombre}


async def get_perfil(user_id: int) -> dict:
    user = await Persona.obtener_por_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return {
        "id":         user["id"],
        "nombre":     user["nombre"],
        "email":      user["email"],
        "telefono":   user["telefono"] or "",
        "rol":        user["rol"],
        "foto_url":   user["foto_url"] if "foto_url" in user.keys() else None,
        "created_at": str(user["created_at"]) if user["created_at"] else None,
    }


async def cambiar_password(user_id: int, body: dict) -> dict:
    from MODULO_HECTOR.utils.encriptador import hash_password, verify_password
    password_actual    = body.get("password_actual", "")
    password_nueva     = body.get("password_nueva", "")
    password_confirmar = body.get("password_confirmar", "")

    user = await Persona.obtener_por_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if not verify_password(password_actual, user["password_hash"]):
        raise HTTPException(status_code=400, detail="La contraseña actual es incorrecta")
    if password_nueva != password_confirmar:
        raise HTTPException(status_code=400, detail="Las contraseñas nuevas no coinciden")
    if len(password_nueva) < 6:
        raise HTTPException(status_code=400, detail="La nueva contraseña debe tener al menos 6 caracteres")

    nuevo_hash = hash_password(password_nueva)
    await Persona.actualizar_password(user_id, nuevo_hash)
    return {"ok": True, "mensaje": "Contraseña actualizada correctamente"}


async def subir_foto(user_id: int, file) -> dict:
    import os, shutil
    from fastapi import HTTPException

    ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
    MAX_SIZE = 5 * 1024 * 1024  # 5 MB

    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400,
                            detail="Formato no permitido. Solo JPG, PNG o WebP")

    content = await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(status_code=400,
                            detail="La imagen no puede superar 5 MB")

    ext_map  = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp"}
    ext      = ext_map[file.content_type]
    filename = f"avatar_{user_id}.{ext}"

    # Ruta absoluta a la carpeta de uploads
    upload_dir = os.path.join(
        os.path.dirname(__file__),           # controllers/
        "..", "..", "..",                     # backend/
        "frontend", "static", "uploads", "avatars"
    )
    upload_dir = os.path.normpath(upload_dir)
    os.makedirs(upload_dir, exist_ok=True)

    # Eliminar foto anterior (cualquier extensión)
    for old_ext in ("jpg", "png", "webp"):
        old = os.path.join(upload_dir, f"avatar_{user_id}.{old_ext}")
        if os.path.exists(old):
            os.remove(old)

    filepath = os.path.join(upload_dir, filename)
    with open(filepath, "wb") as f:
        f.write(content)

    foto_url = f"/static/uploads/avatars/{filename}"
    await Persona.actualizar_foto(user_id, foto_url)
    return {"foto_url": foto_url}
