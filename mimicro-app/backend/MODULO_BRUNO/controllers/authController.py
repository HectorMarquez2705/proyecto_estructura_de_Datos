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
    token = crear_token(usuario["id"], usuario["rol"])
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
    token = crear_token(user_id, rol)
    return {"token": token, "rol": rol, "nombre": nombre}
