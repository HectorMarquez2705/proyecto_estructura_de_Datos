# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**miMicro** — an intelligent public transport platform for Santa Cruz de la Sierra (Bolivia). University project (Data Structures, 3rd semester 2026, UPSA) built by a 6-person team. The full app lives in `mimicro-app/` and consists of:

- **C++ headers** — all data structure logic (18 `.h` files across 6 team directories)
- **Python/FastAPI backend** — REST API + Socket.IO + static file serving, pybind11-linked to C++ core
- **Static HTML/CSS/JS frontend** — served directly by FastAPI at port 3000, no build step needed

The original C++ demo still compiles standalone from `CLASES HECTOR/main.cpp`.

---

## Running the project

### Backend + Frontend (one command)
```bash
cd mimicro-app/backend
pip install -r requirements.txt
python -m uvicorn main:socket_app --reload --port 3000
```
Open `http://localhost:3000` in the browser. FastAPI serves both the API and the static HTML frontend.

### Database
```bash
# PostgreSQL — create DB then run migrations
psql -U postgres -c "CREATE DATABASE mimicro_db;"
psql -U postgres -d mimicro_db -f mimicro-app/backend/database/schema.sql
psql -U postgres -d mimicro_db -f mimicro-app/backend/database/seed.sql
```

### C++ standalone demo (original)
```bash
g++ "CLASES HECTOR/main.cpp" -o miMicro -std=c++17
./miMicro
```

---

## Repository layout

```
PROYECTO_ESTRUCTURA/
├── CLASES HECTOR/        ← C++ headers (Hector: flow analysis, security)
├── CLASES BRUNO/         ← C++ headers (Bruno: Persona, TarjetaTransporte, GestorPagos)
├── CLASES CRISTHIAN/     ← C++ headers (Cristhian: GrafoParadas, OptimizadorRuta, Ruta)
├── CLASES JAVIER/        ← C++ headers (Javier: Parada, PilaHistorial, GestorGPS)
├── CLASES ROBERTO/       ← C++ headers (Roberto: Micro, ListaPasajeros, SensorPuerta)
├── CLASES SAMUEL/        ← C++ headers (Samuel: ColaEspera, TiempoEstimado, NotificacionAlerta)
└── mimicro-app/
    ├── .env                  ← DATABASE_URL, REDIS_URL, JWT_SECRET, PORT=3000
    ├── backend/
    │   ├── main.py           ← FastAPI app, lifespan, router mounts, StaticFiles, Socket.IO ASGI, PWA routes
    │   ├── requirements.txt
    │   ├── create_icons.py   ← Generates PWA PNG icons using Python stdlib only (run once)
    │   ├── cpp_core/         ← pybind11 bindings (bindings.cpp, CMakeLists.txt, setup.py)
    │   ├── database/         ← schema.sql, seed.sql
    │   ├── MODULO_HECTOR/    ← config (db, redis, socket), utils (jwt, bcrypt), middleware
    │   ├── MODULO_BRUNO/     ← auth (login/register/admin/perfil), payments, Persona model
    │   ├── MODULO_CRISTHIAN/ ← rutas, paradas, graph/Dijkstra
    │   ├── MODULO_JAVIER/    ← GPS (Redis cache), historial stack, Socket.IO GPS events
    │   ├── MODULO_ROBERTO/   ← líneas, micros, passenger list, door sensor
    │   ├── MODULO_SAMUEL/    ← wait queue, ETA, notifications
    │   └── frontend/         ← Static HTML/CSS/JS served by FastAPI
    │       ├── index.html        ← Root redirect → /splash/
    │       ├── splash/           ← Animated splash screen (no auth.js — standalone, auto-redirects on JWT)
    │       ├── login/            ← Login page — dark redesign, gradient card, SVG icon inputs
    │       ├── register/         ← Register page — dark redesign, card-style role selector
    │       ├── perfil/           ← Profile page — gradient hero header, shared across all roles
    │       ├── admin/
    │       │   ├── usuarios/     ← User management
    │       │   ├── lineas/       ← Líneas de micro (list, new, detail)
    │       │   │   ├── nueva/    ← New línea form + interactive Leaflet map
    │       │   │   └── detalle/  ← Línea detail: route map + micros table
    │       │   ├── rutas/        ← Routes management (removed from nav, folder kept)
    │       │   ├── micros/       ← Vehicle management (removed from nav, replaced by lineas)
    │       │   └── reportes/     ← KPI dashboard (4 colored cards) + security logs
    │       ├── chofer/
    │       │   ├── ruta/         ← Mobile layout: status bar + mini map + progress + quick actions
    │       │   ├── ocupacion/    ← Mobile card: stacked buttons with emoji
    │       │   └── desvio/       ← Mobile card: gradient danger submit
    │       ├── pasajero/
    │       │   ├── mapa/         ← Live map (Leaflet + Socket.IO)
    │       │   ├── eta/          ← Arrival time estimator — mobile card + icon refresh button
    │       │   ├── tarjeta/      ← Transport card & recharge
    │       │   ├── historial/    ← Stats banner (viajes/Bs/rutas) + trip list
    │       │   └── notificaciones/ ← Filter tabs (Todas/Desvíos/Retrasos/Sistema)
    │       └── static/
    │           ├── global.css        ← Design system: dark theme, bottom nav, mobile header, safe area
    │           ├── favicon.svg
    │           ├── manifest.json     ← PWA Web App Manifest (display: standalone, icons, theme)
    │           ├── sw.js             ← Service Worker: cache-first for static, network-first for /api/*
    │           ├── icons/            ← PWA icons generated by create_icons.py
    │           │   ├── icon-192.png
    │           │   ├── icon-512.png
    │           │   └── apple-touch-icon.png
    │           ├── uploads/avatars/  ← User profile photos (avatar_{id}.{ext})
    │           └── shared/
    │               ├── auth.js       ← PWA meta injection IIFE + Auth.initPage() + dark default theme
    │               ├── api.js        ← Api.get/post/patch/del with JWT headers
    │               ├── layout.js     ← Admin: sidebar | Pasajero/Chofer: mobile-header + bottom-nav
    │               └── socket.js     ← Socket.IO singleton
```

---

## Backend architecture

### Module pattern
Each `MODULO_*/` folder mirrors the C++ directory structure. Every module has `models/`, `controllers/`, `routes/` sub-packages. The top-level `main.py` mounts all routers under their prefixes:

| Module | Router prefix | Key responsibility |
|---|---|---|
| MODULO_HECTOR | — | Config, middleware, JWT, bcrypt, security logs |
| MODULO_BRUNO | `/auth`, `/tarjeta` | Auth, users, transport card, payments, profile |
| MODULO_CRISTHIAN | `/rutas`, `/routing` | Routes, stops, ruta_path-based Dijkstra trip planner |
| MODULO_JAVIER | `/gps` | GPS positions (Redis TTL 30s), history stack |
| MODULO_ROBERTO | `/micros`, `/lineas` | Líneas de micro, vehicle state, occupancy, passenger list |
| MODULO_SAMUEL | `/notificaciones`, `/eta` | Wait queue, ETA calculation, alerts |

### Líneas endpoints (MODULO_ROBERTO)
- `GET /lineas` — list all líneas with micro count (admin only)
- `POST /lineas` — create línea: `{nombre, descripcion, ruta_path: [{lat,lng},...]}` (admin only)
- `GET /lineas/{id}` — línea detail + its micros list (admin only)
- `POST /lineas/{id}/micros` — add micro to línea: `{placa, modelo, descripcion, chofer_id}` (admin only)

Route is stored as a JSONB column `ruta_path` — array of `{lat, lng}` objects drawn by the admin on a Leaflet map. `micros` table gains 3 new columns: `modelo VARCHAR(100)`, `descripcion TEXT`, `linea_id INTEGER FK`.

Migration for existing databases:
```bash
psql -U postgres -d mimicro_db -f mimicro-app/backend/database/migration_lineas.sql
```

### Trip planner endpoint (MODULO_CRISTHIAN)
- `POST /routing/planificar` — Dijkstra over `ruta_path` waypoints. Body: `{origen_lat, origen_lng, destino_lat, destino_lng}`. Returns `{encontrado, tiempo_total_seg, tramos}`.

Each tramo has `tipo: "caminar" | "micro"`. Micro tramos include `ruta_segmento: [{lat,lng}]` (the actual polyline slice of the line). Walking tramos include `desde_lat/lng` + `hasta_lat/lng`. Micro tramos are also enriched with `micro_cercano` from Redis (nearest active bus + ETA).

Algorithm (`MODULO_CRISTHIAN/routing/planificador.py`):
- Graph nodes: `"origen"`, `"destino"` (virtual) + `(linea_id, wp_idx)` per waypoint
- Intra-line edges: forward only `(lid, i) → (lid, i+1)` at bus speed (20 km/h)
- Transfer edges: ≤ `MAX_TRANSFER_M = 200 m` between different lines, at walking speed + 5 min wait
- Origin → all waypoints: unlimited walking + 5 min wait
- All waypoints → destination: unlimited walking
- `itertools.count()` tie-breaking prevents Python TypeError comparing mixed node types in the heap

### Auth endpoints (MODULO_BRUNO)
- `POST /auth/login` — returns JWT + rol + nombre
- `POST /auth/register` — creates pasajero or chofer (not admin)
- `GET /auth/perfil` — returns current user's full profile (requires auth)
- `PATCH /auth/cambiar-password` — change password (requires current password)
- `POST /auth/foto` — upload profile photo (multipart/form-data, max 5 MB, JPG/PNG/WebP)
- `GET /auth/usuarios` — list all users (admin only)
- `PATCH /auth/usuarios/{id}/rol` — change user role (admin only)
- `GET /auth/logs?limite=50` — security log entries (admin only)

### bcrypt / password hashing
`MODULO_HECTOR/utils/encriptador.py` uses the `bcrypt` library directly (NOT passlib — passlib 1.7.4 is incompatible with bcrypt 4+). `requirements.txt` pins `bcrypt==4.2.1`.

```python
import bcrypt as _bcrypt
def hash_password(plain: str) -> str:
    return _bcrypt.hashpw(plain.encode(), _bcrypt.gensalt(rounds=12)).decode()
def verify_password(plain: str, hashed: str) -> bool:
    return _bcrypt.checkpw(plain.encode(), hashed.encode())
```

### File uploads (python-multipart)
`python-multipart==0.0.9` is required for FastAPI to accept `UploadFile`. Profile photos are stored at:
`backend/frontend/static/uploads/avatars/avatar_{user_id}.{ext}`
and served via the existing `/static` StaticFiles mount. When a new photo is uploaded, the old one (any extension) is deleted before saving.

### C++ integration (pybind11)
`cpp_core/bindings.cpp` builds as `mimicro_core` Python module. Include paths go 3 levels up from `cpp_core/`:
```cpp
#include "../../../CLASES HECTOR/Analizador_Flujo_Hector.h"
```
Every Python model does:
```python
try:
    import mimicro_core as _core
    _USE_CPP = True
except ImportError:
    _USE_CPP = False
```
If the module isn't compiled, pure-Python fallbacks handle all logic so the app still runs.

### Real-time GPS (Socket.IO)
- Chofer app → `gps_update` event → server writes to Redis (`gps:micro:{id}`, TTL 30s) + emits `micro_moved` to room `ruta:{rutaId}`
- Pasajero subscribes by emitting `join_ruta` → receives live marker updates
- `gps_stop` event cleans Redis key and emits `micro_offline`
- Trip planner: pasajero emits `join_linea` / `leave_linea` for each micro line in the planned route, receiving the same `micro_moved` / `micro_offline` events filtered by line

### Auth flow
JWT (python-jose) + bcrypt (direct, no passlib). `requiere_rol("admin")` dependency guards admin endpoints. Admin account only exists via `seed.sql` (never via `/auth/register`).

JWT payload: `{ sub: user_id, rol, nombre, exp }`. Decoded client-side with `atob(token.split('.')[1])`.

---

## Frontend architecture

### Stack
Static HTML5 + CSS3 + Vanilla JavaScript. No build step, no framework, no npm. Served directly by FastAPI's `StaticFiles` at `http://localhost:3000`.

### Page structure
Each page folder has 3 files: `index.html`, `script.js`, `styles.css`. All pages follow the same shell pattern:

```html
<div id="app-shell"></div>   <!-- sidebar injected here by layout.js -->
<div class="main-wrap">
  <div id="topbar-mount"></div>  <!-- topbar injected here -->
  <main class="main-content">
    <!-- page content -->
  </main>
</div>
```

### Shared JS modules (loaded in order on every page)
1. `auth.js` — Top-level IIFE injects PWA meta tags (`<link rel="manifest">`, `apple-touch-icon`, `theme-color`, `apple-mobile-web-app-capable`) and registers the service worker on every page load. Then `Auth.initPage(rolRequerido)` checks JWT, redirects if not authenticated/wrong role, and calls `Layout.init(layoutRol)` where `layoutRol = rolRequerido || user?.rol` (the `|| user?.rol` fallback is critical for `/perfil/` which passes `null`). Default theme is `'dark'`. Exposes `Auth.getToken()`, `Auth.getUser()`, `Auth.logout()`, `escapeHtml(str)`.
2. `api.js` — `Api.get/post/patch/del(url, body)` — all calls automatically add `Authorization: Bearer <token>` header. **Note:** DELETE method is `Api.del()`, NOT `Api.delete()` — calling `Api.delete()` throws TypeError.
3. `socket.js` — exports singleton `socket` (Socket.IO connection).
4. `layout.js` — `Layout.init(rol)` branches by role: **admin** gets the full desktop sidebar (Usuarios, Líneas de Micro, Reportes) injected into `#app-shell`; **pasajero** and **chofer** get a `.mobile-header` (brand + theme toggle + logout) injected into `#topbar-mount` and a `.bottom-nav` (4 icon links) injected into `#app-shell`. Body gets class `has-bottom-nav` for CSS layout switching. The splash page (`/splash/`) does NOT load `auth.js` — it has PWA meta tags statically and handles the SW registration inline.

### Auth / token storage
JWT stored in `localStorage` key `mimicro_token`. Decoded with `atob(token.split('.')[1])` (no library). Payload contains `sub` (user_id), `rol`, `nombre`, `exp`.

### CSS Design System (global.css)
CSS custom properties for light/dark mode, role accent colors (`--rc`, `--rl`, `--rh`), spacing scale, shadow scale, border-radius tokens, animations (`fadeIn`, `slideInUp`). Theme toggled via `data-theme="dark"` on `<html>`. Anti-FOUC: inline script reads `localStorage('mimicro_theme')` before CSS loads. Default theme is `dark`.

**Mobile layout pattern (`has-bottom-nav`):** When `layout.js` renders the mobile layout, it adds `has-bottom-nav` to `<body>`. This class is used in `global.css` to:
- `.has-bottom-nav .main-content` → `padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px))`
- `.bottom-nav` → `height: calc(64px + env(safe-area-inset-bottom, 0px))`, uses `env(safe-area-inset-bottom)` for iPhone home bar
- `.mobile-header` → `padding-top: calc(14px + env(safe-area-inset-top, 0px))` for notch area
- `viewport-fit=cover` is set on login and register pages to extend behind the notch

**Key dark palette variables:** `--bg: #0a1628`, `--surface: #162033`, `--surface-2: #1e2d42`, `--border: #2a3a52`, `--cyan: #00d4e8`, gradient buttons use `linear-gradient(135deg, #00cfde, #2563eb)`.

### Map
Leaflet.js loaded from CDN. Center: `[-17.7833, -63.1822]` (Santa Cruz), zoom 13. Default icon URL fix applied. Real-time markers updated via Socket.IO `micro_moved` events.

### StaticFiles mounts in main.py
```python
app.mount("/static",   StaticFiles(directory=".../frontend/static"))
app.mount("/login",    StaticFiles(directory=".../frontend/login",    html=True))
app.mount("/register", StaticFiles(directory=".../frontend/register", html=True))
app.mount("/pasajero", StaticFiles(directory=".../frontend/pasajero", html=True))
app.mount("/chofer",   StaticFiles(directory=".../frontend/chofer",   html=True))
app.mount("/admin",    StaticFiles(directory=".../frontend/admin",    html=True))
app.mount("/perfil",   StaticFiles(directory=".../frontend/perfil",   html=True))
app.mount("/splash",   StaticFiles(directory=".../frontend/splash",   html=True))
```

Root `GET /` serves `frontend/splash/index.html` directly via `FileResponse` (not the old redirect).

**PWA routes added to main.py:**
```python
@app.get("/manifest.json")
async def manifest():
    return FileResponse("...frontend/static/manifest.json",
                        media_type="application/manifest+json")

@app.get("/sw.js")
async def service_worker():
    return FileResponse("...frontend/static/sw.js",
                        media_type="application/javascript",
                        headers={"Service-Worker-Allowed": "/"})
```
These must be defined **before** the StaticFiles mounts so FastAPI routes them first. The `Service-Worker-Allowed: /` header lets the SW registered from `/sw.js` control the entire origin.

### PWA icons
Generated by `backend/create_icons.py` using Python stdlib only (`struct`, `zlib`, `math`). Run once from `backend/`:
```bash
python create_icons.py
```
Outputs `frontend/static/icons/icon-192.png`, `icon-512.png`, `apple-touch-icon.png`. The "M" letter is anti-aliased via point-to-segment distance on a diagonal gradient background.

---

## C++ data structures

| Class | Structure | Location |
|---|---|---|
| `PilaHistorial` | `std::stack<RegistroViaje>` | CLASES JAVIER |
| `ColaEspera` | `std::queue<PasajeroEspera>` | CLASES SAMUEL |
| `GrafoParadas` | bidirectional adjacency list (`std::map`) | CLASES CRISTHIAN |
| `ListaPasajeros` | singly linked list (`NodoPasajero*`) | CLASES ROBERTO |
| `OptimizadorRuta` | Dijkstra (`std::priority_queue`) | CLASES CRISTHIAN |
| `TiempoEstimado` | Haversine formula + velocity | CLASES SAMUEL |

All class definitions live in `.h` files only — no separate `.cpp` files. Language is Spanish throughout.

---

## Database

PostgreSQL (`mimicro_db`), accessed via `asyncpg` (no ORM). Tables: `usuarios`, `tarjetas_transporte`, `transacciones`, `rutas`, `paradas`, `lineas`, `micros`, `historial_viajes`, `notificaciones`. Redis used exclusively for GPS position cache (TTL 30s per micro).

`lineas` table: `id`, `nombre VARCHAR(50) UNIQUE`, `descripcion TEXT`, `ruta_path JSONB` (array of `{lat,lng}` waypoints), `created_at`.
`micros` table additions: `modelo VARCHAR(100)`, `descripcion TEXT`, `linea_id INTEGER FK → lineas(id)`.

`usuarios` table includes `foto_url VARCHAR(500) DEFAULT NULL` column for profile photos.

Seed credentials:
- Admin: `admin@mimicro.bo` / `Admin2026!`
- Chofer: `pedro.rios@mimicro.bo` / `Chofer123!`
- Pasajero: `juan.perez@mail.com` / `Pasajero123!`

## Key environment variables (`.env` in `mimicro-app/`)
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/mimicro_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=<min 32 chars>
JWT_EXPIRES_DAYS=7
PORT=3000
FRONTEND_URL=http://localhost:3000
LOG_FILE=security.log
```
