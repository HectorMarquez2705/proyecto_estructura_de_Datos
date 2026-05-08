from fastapi import APIRouter, Depends, Request, status, UploadFile, File, HTTPException
from MODULO_BRUNO.controllers.authController import (
    login, register, get_perfil, cambiar_password, subir_foto
)
from MODULO_BRUNO.models import Persona
from MODULO_BRUNO.schemas import LoginBody, RegisterBody, CambiarRolBody, CambiarPasswordBody
from MODULO_HECTOR.middleware.authMiddleware import get_current_user
from MODULO_HECTOR.middleware.rolesMiddleware import requiere_rol
from MODULO_HECTOR.services.reporteSeguridad import obtener_logs

router = APIRouter()


@router.post("/login")
async def route_login(body: LoginBody, request: Request):
    return await login(body.model_dump(), request)


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def route_register(body: RegisterBody):
    return await register(body.model_dump())


# ── Perfil ────────────────────────────────────────────────────────────────────

@router.get("/perfil")
async def route_get_perfil(usuario=Depends(get_current_user)):
    return await get_perfil(usuario["user_id"])


@router.patch("/cambiar-password")
async def route_cambiar_password(body: CambiarPasswordBody,
                                  usuario=Depends(get_current_user)):
    return await cambiar_password(usuario["user_id"], body.model_dump())


@router.post("/foto", status_code=status.HTTP_200_OK)
async def route_subir_foto(file: UploadFile = File(...),
                            usuario=Depends(get_current_user)):
    return await subir_foto(usuario["user_id"], file)


# ── Admin ─────────────────────────────────────────────────────────────────────

@router.get("/usuarios", dependencies=[Depends(requiere_rol("admin"))])
async def listar_usuarios():
    return await Persona.listar_todos()


@router.patch("/usuarios/{user_id}/rol", dependencies=[Depends(requiere_rol("admin"))])
async def cambiar_rol_usuario(user_id: int, body: CambiarRolBody):
    from fastapi import HTTPException
    if body.rol not in ("pasajero", "chofer", "admin", "suspendido"):
        raise HTTPException(status_code=400, detail="Rol invalido")
    await Persona.cambiar_rol(user_id, body.rol)
    return {"ok": True, "user_id": user_id, "nuevo_rol": body.rol}


@router.get("/logs", dependencies=[Depends(requiere_rol("admin"))])
async def obtener_logs_seguridad(limite: int = 50):
    return obtener_logs(limite)
