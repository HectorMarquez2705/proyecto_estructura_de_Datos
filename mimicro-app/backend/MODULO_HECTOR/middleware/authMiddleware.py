from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from MODULO_HECTOR.utils.jwtHelper import verificar_token

_bearer = HTTPBearer(auto_error=False)


async def get_current_user(request: Request) -> dict:
    credentials: HTTPAuthorizationCredentials = await _bearer(request)
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Token requerido")
    payload = verificar_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Token invalido o expirado")
    return {"user_id": int(payload["sub"]), "rol": payload["rol"]}
