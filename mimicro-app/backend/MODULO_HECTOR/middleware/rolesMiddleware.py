from fastapi import Depends, HTTPException, status
from MODULO_HECTOR.middleware.authMiddleware import get_current_user


def requiere_rol(*roles: str):
    """Dependencia FastAPI — uso: Depends(requiere_rol('admin'))"""
    def dependency(usuario: dict = Depends(get_current_user)):
        if usuario["rol"] not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Rol requerido: {', '.join(roles)}",
            )
        return usuario
    return dependency
