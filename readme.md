# miMicro — Transporte Inteligente SCZ

Plataforma web de transporte público inteligente para Santa Cruz de la Sierra, Bolivia.
Proyecto universitario — Estructuras de Datos, 3er semestre 2026, UPSA.

---

## Equipo de desarrollo

| Nombre | Registro | Responsabilidad |
|:---|:---|:---|
| Hector Marquez | 2025111291 | Analizador de flujo, seguridad, encriptación, configuración, `main.cpp` |
| Bruno Parada | 2025113242 | GestorPagos, Persona, TarjetaTransporte, autenticación |
| Cristhian Arze | 2025114451 | GrafoParadas, OptimizadorRuta, Ruta |
| Javier Caye | 2025111797 | GestorGPS, Parada, PilaHistorial |
| Roberto Gutierrez | 2025111916 | Micro, ListaPasajeros, SensorPuerta |
| Samuel Carrasco | 2025211490 | ColaEspera, NotificacionAlerta, TiempoEstimado |

---

## Guía de instalación paso a paso

### Requisitos previos

Antes de empezar, instalá estos programas en tu computadora:

| Programa | Versión | Para qué sirve |
|---|---|---|
| [Git](https://git-scm.com/downloads) | cualquiera reciente | clonar el repositorio |
| [Python](https://www.python.org/downloads/) | 3.11 o 3.12 | correr el backend y el frontend |
| [PostgreSQL](https://www.postgresql.org/download/) | 14 o superior | base de datos principal |
| [Redis](https://github.com/tporadowski/redis/releases) | 7 o superior | caché GPS en tiempo real |

> **Python en Windows:** durante la instalación, marcá la casilla **"Add Python to PATH"**. Si ya lo instalaste sin esa opción, reinstalalo marcando esa casilla o usá `py -3.12 -m pip ...` en lugar de `pip ...`.

> **Redis en Windows:** bajá el `.msi` desde la página de releases, instalalo y verificá que el servicio quede activo. En el Administrador de tareas > Servicios buscá "Redis" y arrancálo si no está corriendo.

---

### Paso 1 — Clonar el repositorio

Abrí PowerShell, navegá hasta la carpeta donde querés instalar el proyecto y ejecutá:

```bash
git clone https://github.com/HectorMarquez2705/proyecto_estructura_de_Datos.git
cd proyecto_estructura_de_Datos
```

---

### Paso 2 — Configurar el archivo .env

El archivo `.env` está en `mimicro-app/.env`. Abrilo y modificá la contraseña de PostgreSQL:

```
DATABASE_URL=postgresql://postgres:TU_CONTRASEÑA@localhost:5432/mimicro_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=mimicro_clave_secreta_minimo_32_caracteres_2026
JWT_EXPIRES_DAYS=7
PORT=3000
FRONTEND_URL=http://localhost:3000
LOG_FILE=security.log
```

Reemplazá `TU_CONTRASEÑA` con la contraseña que pusiste al instalar PostgreSQL.

---

### Paso 3 — Crear la base de datos

Ejecutá estos tres comandos **en orden**:

```bash
psql -U postgres -c "CREATE DATABASE mimicro_db;"
psql -U postgres -d mimicro_db -f mimicro-app/backend/database/schema.sql
psql -U postgres -d mimicro_db -f mimicro-app/backend/database/seed.sql
```

Si todo salió bien, el tercer comando va a mostrar mensajes del tipo `INSERT 0 1`.

> **"psql no es reconocido como comando":** Agregá PostgreSQL al PATH del sistema:
> 1. Buscá "Variables de entorno del sistema" en el menú Inicio
> 2. En Variables del sistema, seleccioná `Path` > Editar > Nuevo
> 3. Agregá: `C:\Program Files\PostgreSQL\16\bin` (ajustá el número de versión)
> 4. Cerrá y volvé a abrir la terminal

---

### Paso 4 — Instalar dependencias del backend

```bash
cd mimicro-app/backend
pip install -r requirements.txt
```

Si `pip` falla, usá la versión de Python específica:
```bash
py -3.12 -m pip install -r requirements.txt
```

---

### Paso 5 — Arrancar el servidor

```bash
python -m uvicorn main:socket_app --reload --port 3000
```

> **Importante:** el objetivo es `main:socket_app` (el wrapper ASGI de Socket.IO), **no** `main:app`. Usar `main:app` causa que WebSocket devuelva 403 y el GPS en tiempo real no funciona.

Vas a ver algo como esto, lo que significa que todo está listo:

```
INFO:     Uvicorn running on http://0.0.0.0:3000 (Press CTRL+C to quit)
INFO:     Application startup complete.
```

**Dejá esta terminal abierta** mientras usás la aplicación.

---

### Paso 6 — Abrir la aplicación

Con el servidor corriendo, abrí tu navegador (Chrome recomendado) y entrá a:

```
http://localhost:3000
```

Vas a ver la pantalla de inicio de sesión de miMicro.

> **Nota:** A diferencia de proyectos con frontend separado, miMicro sirve tanto la API como el frontend desde el mismo servidor (puerto 3000). No necesitás correr ningún otro proceso.

---

## Cuentas de prueba

El seed carga automáticamente estas cuentas listas para usar:

| Rol | Email | Contraseña | Acceso a |
|---|---|---|---|
| Admin | admin@mimicro.bo | `Admin2026!` | Panel admin: usuarios, rutas, micros, reportes |
| Chofer | pedro.rios@mimicro.bo | `Chofer123!` | Ruta activa, ocupación, reportar desvíos |
| Chofer | carlos.vaca@mimicro.bo | `Chofer123!` | Ruta activa, ocupación, reportar desvíos |
| Pasajero | juan.perez@mail.com | `Pasajero123!` | Mapa, ETA, tarjeta, historial, notificaciones |
| Pasajero | maria.lopez@mail.com | `Pasajero123!` | Mapa, ETA, tarjeta, historial, notificaciones |

También podés registrarte como pasajero o chofer desde la pantalla de registro (`/register`).

---

## Resumen: arrancar la app en el día a día

Una vez instalado todo, solo necesitás correr **un solo servidor**:

```bash
cd mimicro-app/backend
python -m uvicorn main:socket_app --reload --port 3000
```

Luego abrís `http://localhost:3000` en el navegador. La app abre directamente en la pantalla splash animada y redirige al login.

---

## Progressive Web App (PWA) — instalar en celular

miMicro es una PWA instalable. Podés agregarla a la pantalla de inicio de tu celular **sin pasar por el App Store ni Play Store**.

### Requisitos
- El servidor debe estar accesible por **HTTPS** (en celular real, `localhost` no funciona).
- Para pruebas locales usá **ngrok**:

#### Instalar ngrok (Windows)
```powershell
# Opción 1 — winget (recomendada)
winget install ngrok.ngrok

# Opción 2 — descarga manual
# Ir a https://ngrok.com/download → descargar el .zip → extraer ngrok.exe en C:\Windows\System32
```

Luego registrate gratis en [ngrok.com](https://ngrok.com) y configurá tu authtoken:
```powershell
ngrok config add-authtoken TU_TOKEN_AQUI
```

#### Exponer el servidor con HTTPS
```powershell
# Terminal 1 — servidor backend
cd mimicro-app/backend
python -m uvicorn main:socket_app --reload --port 3000

# Terminal 2 — túnel HTTPS
ngrok http 3000
```

Ngrok te da una URL como `https://xxxx.ngrok-free.app`. Abrila en tu celular.

### Instalar en iPhone (Safari)
1. Abrí la URL de ngrok en **Safari**
2. Tocá el botón de compartir (cuadrado con flecha ↑)
3. Seleccioná **"Agregar a pantalla de inicio"**

### Instalar en Android (Chrome)
1. Abrí la URL de ngrok en **Chrome**
2. Tocá el banner "Instalar app" que aparece automáticamente, o el menú ⋮ → "Agregar a pantalla de inicio"

Una vez instalada, la app se abre en modo standalone (sin barra del navegador) como si fuera una app nativa.

---

## Diseño y experiencia móvil

miMicro tiene un **rediseño completo dark mobile-first**:

- **Tema oscuro por defecto** — paleta `#0a1628` fondo, `#00d4e8` acento cyan, botones con gradiente azul-cyan
- **Pantalla splash** (`/splash/`) — animación de carga antes del login, con auto-redirección según JWT
- **Navegación por bottom nav** (pasajero y chofer) — barra inferior fija con íconos en lugar de sidebar lateral
- **Soporte iOS safe area** — `env(safe-area-inset-bottom/top)` para el notch del iPhone
- **Admin mantiene sidebar** — el diseño de escritorio se conserva para la pantalla de administración

---

## Funcionalidades por rol

### 🧑 Pasajero
- **Mapa en vivo** — posición de los micros en tiempo real (Socket.IO + Leaflet). Incluye planificador de ruta: el pasajero fija un punto de origen y destino en el mapa (o usa su GPS), y el sistema calcula la ruta óptima usando las líneas existentes mediante algoritmo de Dijkstra sobre los waypoints reales de cada línea
- **Tiempo de llegada (ETA)** — estimación basada en distancia y velocidad, con botón de actualización manual
- **Mi Tarjeta** — saldo de la tarjeta de transporte digital y recarga
- **Historial de viajes** — banner con estadísticas (total viajes, total gastado, rutas únicas) + lista cronológica
- **Notificaciones** — alertas filtradas por tipo (Todas / Desvíos / Retrasos / Sistema)
- **Mi Perfil** — header hero con gradiente, datos personales, cambiar contraseña, subir foto

### 🚌 Chofer
- **Ruta Activa** — transmisión de posición GPS en tiempo real
- **Ocupación** — reportar el nivel de ocupación del micro (vacío/medio/lleno)
- **Reportar Desvío** — alertar a los pasajeros cuando se cambia la ruta
- **Mi Perfil** — ver datos personales, cambiar contraseña, subir foto

### 🛠 Administrador
- **Gestión de Usuarios** — ver todos los usuarios y cambiarles el rol
- **Líneas de Micro** — crear y administrar líneas (grupos de micros que comparten una ruta). Incluye mapa interactivo para trazar la ruta, vista de micros por línea y registro de nuevos micros dentro de cada línea
- **Reportes** — dashboard KPI con 4 tarjetas de color (usuarios, líneas, micros, micros activos) + logs de seguridad
- **Mi Perfil** — ver datos personales, cambiar contraseña, subir foto

---

## Estructura del proyecto

```
PROYECTO_ESTRUCTURA/
├── README.md
├── CLAUDE.md                    Guía técnica para desarrollo
├── documentacion_miMicro.html   Documentación completa (para imprimir como PDF)
├── CLASES HECTOR/               C++ — AnalizadorFlujo, ReporteSeguridad
├── CLASES BRUNO/                C++ — Persona, TarjetaTransporte, GestorPagos
├── CLASES CRISTHIAN/            C++ — GrafoParadas, OptimizadorRuta, Ruta
├── CLASES JAVIER/               C++ — Parada, PilaHistorial, GestorGPS
├── CLASES ROBERTO/              C++ — Micro, ListaPasajeros, SensorPuerta
│   └── (Backend: también maneja Líneas de Micro — /lineas endpoints)
├── CLASES SAMUEL/               C++ — ColaEspera, TiempoEstimado, NotificacionAlerta
└── mimicro-app/
    ├── .env                     Configuración: DB, Redis, JWT, puerto
    └── backend/
        ├── main.py              Servidor FastAPI + Socket.IO + rutas PWA (manifest, sw.js)
        ├── requirements.txt
        ├── create_icons.py      Genera íconos PNG para PWA (solo stdlib Python, ejecutar 1 vez)
        ├── cpp_core/            Bindings pybind11 (bindings.cpp, CMakeLists.txt)
        ├── database/
        │   ├── schema.sql       Tablas: usuarios, tarjetas, rutas, micros...
        │   └── seed.sql         Datos iniciales: admin, choferes, pasajeros
        ├── MODULO_HECTOR/       Config DB/Redis, JWT, bcrypt, middleware de roles
        ├── MODULO_BRUNO/        Auth (login/register/perfil/foto), pagos, tarjeta
        ├── MODULO_CRISTHIAN/    Rutas, paradas, Dijkstra
        ├── MODULO_JAVIER/       GPS (Redis TTL 30s), historial, Socket.IO
        ├── MODULO_ROBERTO/      Micros, ocupación, lista de pasajeros
        ├── MODULO_SAMUEL/       Cola de espera, ETA, notificaciones
        └── frontend/            Frontend estático servido por FastAPI
            ├── index.html       Redirección raíz según rol
            ├── login/           Pantalla de inicio de sesión
            ├── register/        Pantalla de registro
            ├── perfil/          Perfil de usuario (todos los roles)
            ├── admin/
            │   ├── usuarios/    Gestión de usuarios
            │   ├── lineas/      Líneas de Micro (lista de líneas)
            │   │   ├── nueva/   Crear línea + mapa interactivo de ruta
            │   │   └── detalle/ Detalle de línea: mapa + tabla de micros
            │   ├── rutas/       (eliminado del menú, carpeta mantenida)
            │   ├── micros/      (eliminado del menú, reemplazado por lineas/)
            │   └── reportes/    Estadísticas y logs de seguridad
            ├── chofer/
            │   ├── ruta/        Ruta activa + emisión GPS
            │   ├── ocupacion/   Reporte de ocupación
            │   └── desvio/      Reporte de desvíos
            ├── pasajero/
            │   ├── mapa/        Mapa en tiempo real
            │   ├── eta/         Tiempo de llegada
            │   ├── tarjeta/     Tarjeta de transporte
            │   ├── historial/   Historial de viajes
            │   └── notificaciones/ Notificaciones
            ├── splash/              Pantalla de inicio animada (sin auth, redirige según JWT)
        └── static/
                ├── global.css       Sistema de diseño (dark theme, bottom nav, safe area)
                ├── favicon.svg
                ├── manifest.json    Web App Manifest (PWA — nombre, íconos, display:standalone)
                ├── sw.js            Service Worker (cache-first estáticos, network-first API)
                ├── icons/           Íconos PWA generados automáticamente
                │   ├── icon-192.png
                │   ├── icon-512.png
                │   └── apple-touch-icon.png
                ├── uploads/avatars/ Fotos de perfil: avatar_{id}.{ext}
                └── shared/
                    ├── auth.js      JWT, initPage(), PWA meta injection, dark default
                    ├── api.js       Fetch wrapper con Authorization header
                    ├── layout.js    Admin: sidebar | Pasajero/Chofer: bottom nav móvil
                    └── socket.js    Conexión Socket.IO compartida
```

---

## API REST — Endpoints principales

### Autenticación y perfil (`/auth`)
| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| POST | `/auth/login` | Iniciar sesión, devuelve JWT | No |
| POST | `/auth/register` | Registrar pasajero o chofer | No |
| GET | `/auth/perfil` | Ver perfil del usuario actual | Sí |
| PATCH | `/auth/cambiar-password` | Cambiar contraseña | Sí |
| POST | `/auth/foto` | Subir foto de perfil (multipart) | Sí |
| GET | `/auth/usuarios` | Listar todos los usuarios | Admin |
| PATCH | `/auth/usuarios/{id}/rol` | Cambiar rol de un usuario | Admin |
| GET | `/auth/logs` | Ver logs de seguridad | Admin |

### Tarjeta de transporte (`/tarjeta`)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/tarjeta/mi-tarjeta` | Ver saldo y número de tarjeta |
| POST | `/tarjeta/recargar` | Recargar saldo |
| GET | `/tarjeta/historial` | Historial de transacciones |

### Rutas y paradas (`/rutas`)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/rutas` | Listar todas las rutas |
| POST | `/rutas` | Crear ruta (admin) |
| GET | `/rutas/{id}/paradas` | Paradas de una ruta |
| GET | `/rutas/{id}/camino` | Ruta más corta (Dijkstra) |

### GPS y micros (`/gps`, `/micros`)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/gps/{micro_id}` | Posición actual de un micro |
| GET | `/micros` | Listar micros |
| POST | `/micros` | Registrar micro (admin) |
| PATCH | `/micros/{id}/ocupacion` | Actualizar ocupación |

### Líneas de Micro (`/lineas`)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/lineas` | Listar todas las líneas (admin) |
| POST | `/lineas` | Crear nueva línea con ruta en mapa (admin) |
| GET | `/lineas/{id}` | Detalle de línea + micros asignados (admin) |
| POST | `/lineas/{id}/micros` | Agregar micro a una línea (admin) |

### Planificador de ruta (`/routing`)
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/routing/planificar` | Calcula la ruta óptima entre origen y destino usando las líneas existentes. Body: `{origen_lat, origen_lng, destino_lat, destino_lng}`. Devuelve tramos con tipo `caminar` o `micro`, incluyendo el segmento de ruta real de cada línea y el micro activo más cercano (desde Redis). |

### Notificaciones y ETA (`/notificaciones`, `/eta`)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/notificaciones/{usuario_id}` | Ver notificaciones |
| POST | `/notificaciones` | Crear notificación |
| GET | `/eta/{ruta_id}/{parada_id}` | Tiempo de llegada estimado |

---

## Solución de problemas

### "pip no es reconocido" o "Python no encontrado"
- Asegurate de haber marcado "Add Python to PATH" al instalar
- Probá con: `py -3.12 -m pip install -r requirements.txt`
- Si hay error de ruta, intentá reparar la instalación: `py install --repair 3.12`

### El backend dice "Error de conexión a la base de datos"
- Verificá que PostgreSQL esté corriendo (Administrador de tareas > Servicios)
- Verificá que la contraseña en `.env` sea correcta
- Comprobá que la DB existe: `psql -U postgres -l` (debe aparecer `mimicro_db`)

### El backend dice "Redis connection refused"
- Iniciá Redis: Administrador de tareas > Servicios > Redis > Iniciar
- O ejecutá `redis-server` en una terminal separada

### La página muestra error 500 al iniciar sesión
- Verificá que el seed fue ejecutado (Paso 3)
- Revisá que la columna `foto_url` existe en la tabla `usuarios`:
  ```sql
  ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS foto_url VARCHAR(500) DEFAULT NULL;
  ```

### No se puede subir foto de perfil
- Verificá que `python-multipart` está instalado: `pip install python-multipart`
- El directorio `frontend/static/uploads/avatars/` debe existir (se crea automáticamente)

### El mapa no muestra los micros en tiempo real
- Redis debe estar activo para el caché GPS
- El chofer debe estar en la misma ruta que el pasajero (`join_ruta`)

### WebSocket devuelve 403 al iniciar el servidor
- Verificá que estás usando `main:socket_app` y **no** `main:app` en el comando uvicorn
- `main:app` es solo FastAPI puro; Socket.IO necesita el wrapper ASGI `socket_app`

### Al agregar un micro aparece "Error al cargar la línea"
- Es el bug de re-inicialización de Leaflet — ya corregido en la versión actual
- Si persiste, refrescá el caché del navegador (Ctrl+Shift+R)

### "Error al cargar paradas" en el detalle de línea
- La tabla `paradas_linea` puede no existir si corriste la migración antes de que se agregara
- Solución: `psql -U postgres -d mimicro_db -f "ruta\completa\migration_lineas.sql"` (usar ruta absoluta)

### La app no se puede instalar como PWA en el celular
- Verificá que estés accediendo por **HTTPS** (ngrok o servidor con certificado). `http://localhost` no activa el install prompt en móvil
- En iPhone: **solo Safari** muestra la opción "Agregar a pantalla de inicio". Chrome en iOS no lo permite
- Si el service worker no se registra, revisá la consola del navegador. Debe aparecer `[SW] registrado`
- Si los íconos faltan, ejecutá `python create_icons.py` desde `mimicro-app/backend/`

### "ngrok" no es reconocido como comando
- Instalalo con: `winget install ngrok.ngrok` (reiniciar la terminal después)
- O descargá el `.zip` desde ngrok.com, extraé `ngrok.exe` en una carpeta del PATH (ej: `C:\Windows\System32`)
- Después de instalar: `ngrok config add-authtoken TU_TOKEN` (token gratuito en ngrok.com)
