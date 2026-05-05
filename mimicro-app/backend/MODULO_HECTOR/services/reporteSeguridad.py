import os
import json
from datetime import datetime
from pathlib import Path

LOG_FILE = Path(os.environ.get("LOG_FILE", "security.log"))


def _escribir(nivel: str, evento: str, usuario: str = "", ip: str = ""):
    entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "nivel":    nivel,
        "evento":   evento,
        "usuario":  usuario,
        "ip":       ip,
    }
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry) + "\n")


def log_acceso(usuario: str, ip: str, exitoso: bool):
    nivel  = "INFO" if exitoso else "WARNING"
    evento = "LOGIN_OK" if exitoso else "LOGIN_FAIL"
    _escribir(nivel, evento, usuario, ip)


def log_error(evento: str, detalle: str = ""):
    _escribir("ERROR", f"{evento}: {detalle}")


def log_advertencia(evento: str, detalle: str = ""):
    _escribir("WARNING", f"{evento}: {detalle}")


def obtener_logs(limite: int = 100) -> list:
    if not LOG_FILE.exists():
        return []
    lineas = LOG_FILE.read_text(encoding="utf-8").strip().splitlines()
    return [json.loads(l) for l in lineas[-limite:]]
