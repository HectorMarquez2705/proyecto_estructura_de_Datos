import os
from datetime import datetime, timedelta
from jose import jwt, JWTError

SECRET = os.environ.get("JWT_SECRET", "cambiar_en_produccion_min32chars!!")
ALGORITHM = "HS256"
EXPIRES_DAYS = int(os.environ.get("JWT_EXPIRES_DAYS", "7"))


def crear_token(user_id: int, rol: str) -> str:
    payload = {
        "sub": str(user_id),
        "rol": rol,
        "exp": datetime.utcnow() + timedelta(days=EXPIRES_DAYS),
    }
    return jwt.encode(payload, SECRET, algorithm=ALGORITHM)


def verificar_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET, algorithms=[ALGORITHM])
    except JWTError:
        return None
