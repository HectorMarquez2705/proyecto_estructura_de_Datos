from pydantic import BaseModel, field_validator
from typing import Optional


class CrearNotifBody(BaseModel):
    usuario_id: int
    mensaje: str
    tipo: str = "info"

    @field_validator('mensaje')
    @classmethod
    def mensaje_strip(cls, v):
        return v.strip()


class DesvioBody(BaseModel):
    descripcion: str
    ruta_id: int

    @field_validator('descripcion')
    @classmethod
    def descripcion_strip(cls, v):
        return v.strip()
