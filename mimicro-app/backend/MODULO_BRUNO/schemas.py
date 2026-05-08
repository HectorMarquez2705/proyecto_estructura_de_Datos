from pydantic import BaseModel, field_validator


class LoginBody(BaseModel):
    email: str
    password: str

    @field_validator('email')
    @classmethod
    def email_lower(cls, v):
        return v.strip().lower()


class RegisterBody(BaseModel):
    nombre: str
    email: str
    password: str
    rol: str = "pasajero"
    telefono: str = ""

    @field_validator('email')
    @classmethod
    def email_lower(cls, v):
        return v.strip().lower()

    @field_validator('nombre')
    @classmethod
    def nombre_strip(cls, v):
        return v.strip()


class CambiarRolBody(BaseModel):
    rol: str


class RecargarBody(BaseModel):
    monto: float


class CambiarPasswordBody(BaseModel):
    password_actual:   str
    password_nueva:    str
    password_confirmar: str
