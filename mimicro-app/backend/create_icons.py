"""
Genera los íconos PNG para la PWA de miMicro.
Solo usa Python stdlib — sin dependencias externas.
Ejecutar una vez: python create_icons.py
"""
import struct, zlib, math, os


# ── Geometría ────────────────────────────────────────────────
def _seg_dist(px, py, ax, ay, bx, by):
    dx, dy = bx - ax, by - ay
    l2 = dx * dx + dy * dy
    if l2 < 1e-10:
        return math.hypot(px - ax, py - ay)
    t = max(0.0, min(1.0, ((px - ax) * dx + (py - ay) * dy) / l2))
    return math.hypot(px - ax - t * dx, py - ay - t * dy)


def _lerp(a, b, t):
    t = max(0.0, min(1.0, t))
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def _blend(bg, fg, alpha):
    return tuple(int(bg[i] * (1 - alpha) + fg[i] * alpha) for i in range(3))


# ── Generar píxeles del ícono ─────────────────────────────────
def _render(size):
    c_dark = (10,  22,  40)   # #0a1628
    c_blue = (37,  99,  235)  # #2563eb
    c_cyan = (0,  212,  232)  # #00d4e8
    white  = (255, 255, 255)

    # Letra M definida como 4 segmentos en espacio normalizado [0,1]
    pad = 0.20
    segs = [
        (pad,     pad, pad,     1 - pad),   # barra izquierda
        (pad,     pad, 0.5,     0.5 + 0.05),# diagonal izq (baja al centro)
        (0.5, 0.5 + 0.05, 1 - pad, pad),   # diagonal der
        (1 - pad, pad, 1 - pad, 1 - pad),   # barra derecha
    ]
    stroke = 0.055  # grosor relativo

    raw = bytearray()
    for y in range(size):
        raw.append(0)                       # filtro PNG = None
        for x in range(size):
            nx, ny = x / (size - 1), y / (size - 1)

            # ── Fondo gradiente diagonal ──────────────────────
            t = (nx + ny) / 2
            if t < 0.5:
                bg = _lerp(c_dark, c_blue, t * 2)
            else:
                bg = _lerp(c_blue, c_cyan, (t - 0.5) * 2)

            # ── Dibujar M con antialiasing ────────────────────
            d = min(_seg_dist(nx, ny, *s) for s in segs)
            hard = stroke * 0.72
            if d < hard:
                raw.extend(white)
            elif d < stroke:
                alpha = 1 - (d - hard) / (stroke - hard)
                raw.extend(_blend(bg, white, alpha))
            else:
                raw.extend(bg)

    return bytes(raw)


# ── Escritura PNG ─────────────────────────────────────────────
def _write_png(path, size):
    raw = _render(size)
    compressed = zlib.compress(raw, 6)

    def chunk(name: bytes, data: bytes) -> bytes:
        crc = zlib.crc32(name + data) & 0xFFFFFFFF
        return struct.pack(">I", len(data)) + name + data + struct.pack(">I", crc)

    ihdr = struct.pack(">IIBBBBB", size, size, 8, 2, 0, 0, 0)  # RGB, 8-bit
    png = (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", ihdr)
        + chunk(b"IDAT", compressed)
        + chunk(b"IEND", b"")
    )
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as f:
        f.write(png)
    print(f"  ✅  {path}  ({size}×{size} px, {len(png):,} bytes)")


# ── Main ──────────────────────────────────────────────────────
if __name__ == "__main__":
    base = os.path.join(os.path.dirname(__file__), "frontend", "static", "icons")
    print("Generando íconos PWA para miMicro…")
    _write_png(os.path.join(base, "icon-192.png"),         192)
    _write_png(os.path.join(base, "icon-512.png"),         512)
    _write_png(os.path.join(base, "apple-touch-icon.png"), 180)
    print("Listo.")
