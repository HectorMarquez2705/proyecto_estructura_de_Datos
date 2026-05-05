from fastapi import HTTPException, status
from functools import wraps
from typing import List


def requiere_rol(*roles: str):
    """Decorator de dependencia — uso: Depends(requiere_rol('admin'))"""
    def dependency(usuario: dict):
        if usuario["rol"] not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Rol requerido: {', '.join(roles)}"
            )
        return usuario
    return dependency
