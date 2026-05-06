from fastapi import APIRouter, Depends, Request
from MODULO_BRUNO.controllers.authController import login, register
from MODULO_BRUNO.models import Persona
from MODULO_HECTOR.middleware.authMiddleware import get_current_user
from MODULO_HECTOR.middleware.rolesMiddleware import requiere_rol
from MODULO_HECTOR.services.reporteSeguridad import obtener_logs

router = APIRouter()


@router.post("/login")
async def route_login(request: Request):
    body = await request.json()
    return await login(body, request)


@router.post("/register")
async def route_register(request: Request):
    body = await request.json()
    return await register(body)


# ── Admin routes ──────────────────────────────────────────────────────────────

@router.get("/usuarios", dependencies=[Depends(requiere_rol("admin"))])
async def listar_usuarios():
    usuarios = await Persona.listar_todos()
    return {"usuarios": usuarios}


@router.patch("/usuarios/{user_id}/rol", dependencies=[Depends(requiere_rol("admin"))])
async def cambiar_rol_usuario(user_id: int, request: Request):
    body = await request.json()
    nuevo_rol = body.get("rol", "")
    if nuevo_rol not in ("pasajero", "chofer", "admin", "suspendido"):
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Rol invalido")
    await Persona.cambiar_rol(user_id, nuevo_rol)
    return {"ok": True, "user_id": user_id, "nuevo_rol": nuevo_rol}


@router.get("/logs", dependencies=[Depends(requiere_rol("admin"))])
async def obtener_logs_seguridad(limite: int = 100):
    logs = obtener_logs(limite)
    return {"logs": logs}
