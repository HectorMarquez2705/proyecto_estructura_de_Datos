# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**miMicro** — an intelligent public transport platform for Santa Cruz de la Sierra (Bolivia). University project (Data Structures, 3rd semester 2026, UPSA) built by a 6-person team. The full app lives in `mimicro-app/` and consists of:

- **C++ headers** — all data structure logic (18 `.h` files across 6 team directories)
- **Python/FastAPI backend** — REST API + Socket.IO, pybind11-linked to C++ core
- **React + Vite frontend** — web-only app (desktop), no mobile/Expo

The original C++ demo still compiles standalone from `CLASES HECTOR/main.cpp`.

---

## Running the project

### Backend
```bash
cd mimicro-app/backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 3000
```

### Frontend
```bash
cd mimicro-app/frontend
npm install
npm run dev        # opens http://localhost:5173
```

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
    │   ├── main.py           ← FastAPI app, lifespan, router mounts, Socket.IO ASGI
    │   ├── requirements.txt
    │   ├── cpp_core/         ← pybind11 bindings (bindings.cpp, CMakeLists.txt, setup.py)
    │   ├── database/         ← schema.sql, seed.sql
    │   ├── MODULO_HECTOR/    ← config (db, redis, socket), utils (jwt, bcrypt), middleware
    │   ├── MODULO_BRUNO/     ← auth (login/register/admin), payments, Persona model
    │   ├── MODULO_CRISTHIAN/ ← rutas, paradas, graph/Dijkstra
    │   ├── MODULO_JAVIER/    ← GPS (Redis cache), historial stack, Socket.IO GPS events
    │   ├── MODULO_ROBERTO/   ← micros, passenger list, door sensor
    │   └── MODULO_SAMUEL/    ← wait queue, ETA, notifications
    └── frontend/
        ├── package.json      ← React 18, react-router-dom, react-leaflet, socket.io-client
        ├── vite.config.js    ← Vite proxy: /auth /rutas /gps /micros... → localhost:3000
        ├── index.html
        └── src/
            ├── App.jsx           ← BrowserRouter, ProtectedRoute, role-based redirect
            ├── index.css         ← CSS variables, layout, badges, tables, modals
            ├── context/          ← AuthContext (JWT in localStorage, decoded with atob)
            ├── services/         ← authService, gpsService, rutasService, pagosService, notifService
            ├── components/       ← Layout (sidebar+topbar), MapaInteractivo (react-leaflet), Toast
            └── screens/
                ├── auth/         ← LoginScreen, RegisterScreen
                ├── admin/        ← GestionUsuarios, GestionRutas, GestionMicros, Reportes
                ├── chofer/       ← RutaActiva, ReportarOcupacion, ReportarDesvio
                └── pasajero/     ← Mapa, ETA, Tarjeta, Historial, Notificaciones
```

---

## Backend architecture

### Module pattern
Each `MODULO_*/` folder mirrors the C++ directory structure. Every module has `models/`, `controllers/`, `routes/` sub-packages. The top-level `main.py` mounts all routers under their prefixes:

| Module | Router prefix | Key responsibility |
|---|---|---|
| MODULO_HECTOR | — | Config, middleware, JWT, bcrypt, security logs |
| MODULO_BRUNO | `/auth`, `/tarjeta` | Auth, users, transport card, payments |
| MODULO_CRISTHIAN | `/rutas` | Routes, stops, Dijkstra shortest path |
| MODULO_JAVIER | `/gps` | GPS positions (Redis TTL 30s), history stack |
| MODULO_ROBERTO | `/micros` | Vehicle state, occupancy, passenger list |
| MODULO_SAMUEL | `/notificaciones`, `/eta` | Wait queue, ETA calculation, alerts |

### bcrypt / password hashing
`MODULO_HECTOR/utils/encriptador.py` uses the `bcrypt` library directly (NOT passlib — passlib 1.7.4 is incompatible with bcrypt 4+). `requirements.txt` pins `bcrypt==4.2.1`.

```python
import bcrypt as _bcrypt
def hash_password(plain: str) -> str:
    return _bcrypt.hashpw(plain.encode(), _bcrypt.gensalt(rounds=12)).decode()
def verify_password(plain: str, hashed: str) -> bool:
    return _bcrypt.checkpw(plain.encode(), hashed.encode())
```

### C++ integration (pybind11)
`cpp_core/bindings.cpp` builds as `mimicro_core` Python module. Every Python model does:
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

### Auth flow
JWT (python-jose) + bcrypt (direct, no passlib). `requiere_rol("admin")` dependency guards admin endpoints. Admin account only exists via `seed.sql` (never via `/auth/register` which only allows `pasajero`/`chofer`).

Admin endpoints (all require `Authorization: Bearer <token>` with `rol=admin`):
- `GET /auth/usuarios` — list all users
- `PATCH /auth/usuarios/{id}/rol` — change user role
- `GET /auth/logs?limite=50` — security log entries

---

## Frontend architecture

### Stack
React 18 + Vite 5 + React Router v6. Web-only (desktop). No React Native, no Expo.

### Vite proxy
All API calls use relative URLs (`/auth/login`, `/rutas`, etc.). Vite proxies them to `http://localhost:3000` in development. No CORS config needed on the frontend.

### Routing
`App.jsx` uses `BrowserRouter` with `ProtectedRoute` (checks `useAuth()` role). Three role-based sub-trees:
- `/pasajero/*` — requires `rol === 'pasajero'`
- `/chofer/*` — requires `rol === 'chofer'`
- `/admin/*` — requires `rol === 'admin'`

`RootRedirect` at `/` sends each role to their home screen.

### Auth / token storage
`AuthContext.jsx`: JWT stored in `localStorage` key `mimicro_token`. Decoded with `atob()` (standard base64, no library needed). `useAuth()` hook exposes `{ user, login, logout }`.

### Map component
`components/MapaInteractivo.jsx` uses `react-leaflet` + OpenStreetMap tiles. Leaflet default icon fix: `delete L.Icon.Default.prototype._getIconUrl` + CDN URLs from unpkg. Center: `[-17.7833, -63.1822]` (Santa Cruz), zoom 13.

### Real-time GPS (Socket.IO client)
`services/gpsService.js`:
- `suscribirMapa(rutaId, onMoved, onOffline)` — joins `ruta:{rutaId}` room, returns cleanup fn
- `emitirGPS(microId, lat, lng, velocidad)` — chofer emits position
- Socket: `io({ path: '/socket.io', transports: ['websocket', 'polling'] })`

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

PostgreSQL (`mimicro_db`), accessed via `asyncpg` (no ORM). Tables: `usuarios`, `tarjetas_transporte`, `transacciones`, `rutas`, `paradas`, `micros`, `historial_viajes`, `notificaciones`. Redis used exclusively for GPS position cache (TTL 30s per micro).

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
FRONTEND_URL=http://localhost:5173
LOG_FILE=security.log
```
