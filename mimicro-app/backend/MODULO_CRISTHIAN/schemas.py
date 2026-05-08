from pydantic import BaseModel, field_validator


class CrearRutaBody(BaseModel):
    nombre: str
    descripcion: str = ""
    origen: str = ""
    destino: str = ""

    @field_validator('nombre')
    @classmethod
    def nombre_strip(cls, v):
        return v.strip()


class ActualizarRutaBody(BaseModel):
    nombre: str
    descripcion: str = ""

    @field_validator('nombre')
    @classmethod
    def nombre_strip(cls, v):
        return v.strip()
