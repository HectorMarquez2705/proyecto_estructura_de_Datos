from pydantic import BaseModel, field_validator
from typing import Optional, List, Any


class CrearMicroBody(BaseModel):
    placa: str
    capacidad: int = 30
    chofer_id: Optional[int] = None
    ruta_id: Optional[int] = None

    @field_validator('placa')
    @classmethod
    def placa_upper(cls, v):
        return v.strip().upper()


class PatchOcupacionBody(BaseModel):
    estado: str  # vacio | medio | lleno


class PatchEstadoBody(BaseModel):
    estado: str  # activo | inactivo


class CrearLineaBody(BaseModel):
    nombre: str
    descripcion: str = ''
    ruta_path: List[Any] = []  # lista de {lat, lng}

    @field_validator('nombre')
    @classmethod
    def nombre_strip(cls, v):
        return v.strip()


class CrearMicroEnLineaBody(BaseModel):
    placa: str
    modelo: str = ''
    descripcion: str = ''
    chofer_id: Optional[int] = None

    @field_validator('placa')
    @classmethod
    def placa_upper(cls, v):
        return v.strip().upper()


class CrearParadaLineaBody(BaseModel):
    nombre: str
    lat: float
    lng: float

    @field_validator('nombre')
    @classmethod
    def nombre_strip(cls, v):
        return v.strip()


class ActualizarRutaBody(BaseModel):
    ruta_path: List[Any] = []
