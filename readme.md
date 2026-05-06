# miMicro — Transporte Inteligente SCZ

Plataforma web de transporte público inteligente para Santa Cruz de la Sierra, Bolivia.
Proyecto universitario — Estructuras de Datos, 3er semestre 2026, UPSA.

---

## Equipo de desarrollo

| Nombre | Registro | Responsabilidad |
|:---|:---|:---|
| Hector Marquez | 2025111291 | Analizador de flujo, seguridad, encriptación, `main.cpp` |
| Bruno Parada | 2025113242 | GestorPagos, Persona, TarjetaTransporte |
| Cristhian Arze | 2025114451 | GrafoParadas, OptimizadorRuta, Ruta |
| Javier Caye | 2025111797 | GestorGPS, Parada, PilaHistorial |
| Roberto Gutierrez | 2025111916 | Micro, ListaPasajeros, SensorPuerta |
| Samuel Carrasco | 2025211490 | ColaEspera, NotificacionAlerta, TiempoEstimado |

---

## Guía de instalación paso a paso

### Requisitos previos

Antes de empezar, instalá estos programas en tu computadora. Hacé clic en cada enlace para descargar:

| Programa | Versión | Para qué sirve |
|---|---|---|
| [Git](https://git-scm.com/downloads) | cualquiera reciente | clonar el repositorio |
| [Python 3.11](https://www.python.org/downloads/release/python-3119/) | **3.11 exactamente** | correr el backend |
| [PostgreSQL](https://www.postgresql.org/download/) | 14 o superior | base de datos |
| [Redis](https://github.com/tporadowski/redis/releases) | 7 o superior | caché GPS en tiempo real |
| [Node.js](https://nodejs.org/en/download) | 18 o superior | correr el frontend |

> **Por qué Python 3.11 específicamente:** algunas dependencias del backend no tienen versiones precompiladas para Python 3.12+ en Windows y requieren compilar desde código fuente, lo que puede fallar. Python 3.11 funciona sin problemas.

> **Redis en Windows:** en la página de releases bajá el archivo `.msi`, instalalo y asegurate de que el servicio quede activo. Si no lo activaste, buscá "Redis" en el Administrador de tareas > Servicios y arrancálo.

---

### Paso 1 — Clonar el repositorio

Abrí PowerShell o una terminal CMD, navegá hasta la carpeta donde querés instalar el proyecto y ejecutá:

```bash
git clone https://github.com/HectorMarquez2705/proyecto_estructura_de_Datos.git
cd proyecto_estructura_de_Datos
```

---

### Paso 2 — Configurar el archivo .env

El archivo `.env` contiene la configuración de la base de datos. Está en `mimicro-app/.env`.

Abrilo con el Bloc de Notas o cualquier editor y modificá la contraseña:

```
DATABASE_URL=postgresql://postgres:TU_CONTRASEÑA@localhost:5432/mimicro_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=mimicro_clave_secreta_minimo_32_caracteres_2026
JWT_EXPIRES_DAYS=7
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
LOG_FILE=security.log
```

Reemplazá `TU_CONTRASEÑA` con la contraseña que pusiste al instalar PostgreSQL. Si no la cambiaste, probá con `postgres`.

---

### Paso 3 — Crear la base de datos

Abrí una terminal y ejecutá estos tres comandos **en orden**:

```bash
psql -U postgres -c "CREATE DATABASE mimicro_db;"
```

```bash
psql -U postgres -d mimicro_db -f mimicro-app/backend/database/schema.sql
```

```bash
psql -U postgres -d mimicro_db -f mimicro-app/backend/database/seed.sql
```

Si todo salió bien, el tercer comando va a mostrar mensajes del tipo `INSERT 0 1` y `INSERT 0 3`.

> **"psql no es reconocido como comando"** — Necesitás agregar PostgreSQL a tu PATH:
> 1. Abrí el menú Inicio y buscá "Variables de entorno del sistema"
> 2. En la sección de abajo (Variables del sistema), seleccioná `Path` y hacé clic en "Editar"
> 3. Hacé clic en "Nuevo" y agregá: `C:\Program Files\PostgreSQL\16\bin` (ajustá el número de versión si es diferente)
> 4. Cerrá y volvé a abrir la terminal

---

### Paso 4 — Instalar y arrancar el backend

**Abrí una terminal nueva** (no cierres ninguna de las anteriores) y ejecutá:

```bash
cd mimicro-app/backend
pip install -r requirements.txt
```

La instalación puede tardar unos minutos. Cuando termine, iniciá el servidor:

```bash
python -m uvicorn main:app --reload --port 3000
```

Vas a ver algo como esto, lo que significa que el backend está listo:

```
INFO:     Uvicorn running on http://0.0.0.0:3000 (Press CTRL+C to quit)
INFO:     Started reloader process [...]
INFO:     Application startup complete.
```

**Dejá esta terminal abierta** mientras usás la aplicación.

---

### Paso 5 — Instalar y arrancar el frontend

**Abrí otra terminal nueva** y ejecutá:

```bash
cd mimicro-app/frontend
npm install
```

Una vez que termina la instalación, iniciá el servidor:

```bash
npm run dev
```

Vas a ver:

```
  VITE v5.x  ready in ~300ms

  Local:   http://localhost:5173/
```

**Dejá esta terminal abierta también.**

---

### Paso 6 — Abrir la aplicación en el navegador

Con las dos terminales corriendo, abrí tu navegador (Chrome, Firefox, Edge — cualquiera) y entrá a:

```
http://localhost:5173
```

Vas a ver la pantalla de inicio de sesión de miMicro.

---

## Cuentas de prueba

El seed carga automáticamente estas cuentas listas para usar:

| Rol | Email | Contraseña | Acceso a |
|---|---|---|---|
| Admin | admin@mimicro.bo | `Admin2026!` | Panel de administración: usuarios, rutas, micros, reportes |
| Chofer | pedro.rios@mimicro.bo | `Chofer123!` | Ruta activa, ocupación, reportar desvíos |
| Chofer | carlos.vaca@mimicro.bo | `Chofer123!` | Ruta activa, ocupación, reportar desvíos |
| Pasajero | juan.perez@mail.com | `Pasajero123!` | Mapa, ETA, tarjeta, historial, notificaciones |
| Pasajero | maria.lopez@mail.com | `Pasajero123!` | Mapa, ETA, tarjeta, historial, notificaciones |

También podés registrarte como pasajero o chofer desde la pantalla de registro.

---

## Resumen de los dos servidores que necesitás correr

Una vez instalado todo, para usar la app en el día a día solo necesitás ejecutar:

**Terminal 1 — Backend:**
```bash
cd mimicro-app/backend
python -m uvicorn main:app --reload --port 3000
```

**Terminal 2 — Frontend:**
```bash
cd mimicro-app/frontend
npm run dev
```

Luego abrís `http://localhost:5173` en el navegador.

El frontend se comunica con el backend automáticamente a través del proxy de Vite — no hace falta configurar nada extra.

---

## Solución de problemas

### El backend dice "Error de conexión a la base de datos"
- Verificá que PostgreSQL esté corriendo: buscá el servicio en el Administrador de tareas
- Verificá que la contraseña en `.env` coincida con la de tu instalación de PostgreSQL
- Verificá que la base de datos fue creada: `psql -U postgres -l` (debe aparecer `mimicro_db` en la lista)

### El backend dice "Redis connection refused"
- Redis tiene que estar corriendo en segundo plano
- En Windows: Administrador de tareas > pestaña Servicios > buscá `Redis` > clic derecho > Iniciar
- O ejecutá `redis-server` en una terminal separada

### "pip no es reconocido como comando"
- Asegurate de haber instalado Python 3.11 y de haber marcado la opción "Add Python to PATH" durante la instalación
- Si ya lo instalaste sin esa opción, reinstalalo y marcá esa casilla

### "npm no es reconocido como comando"
- Instalá Node.js desde https://nodejs.org y volvé a abrir la terminal

### La página muestra error 500 al intentar iniciar sesión
- Verificá que el backend esté corriendo en la Terminal 1
- Verificá que el seed fue ejecutado correctamente (Paso 3)
- Si lo instalaste recientemente, asegurate de haber ejecutado los tres comandos del Paso 3

---

## Estructura del proyecto

```
PROYECTO_ESTRUCTURA/
├── README.md
├── CLASES HECTOR/         C++ — AnalizadorFlujo, ReporteSeguridad
├── CLASES BRUNO/          C++ — Persona, TarjetaTransporte, GestorPagos
├── CLASES CRISTHIAN/      C++ — GrafoParadas, OptimizadorRuta, Ruta
├── CLASES JAVIER/         C++ — Parada, PilaHistorial, GestorGPS
├── CLASES ROBERTO/        C++ — Micro, ListaPasajeros, SensorPuerta
├── CLASES SAMUEL/         C++ — ColaEspera, TiempoEstimado, NotificacionAlerta
└── mimicro-app/
    ├── .env               Configuración: base de datos, JWT, Redis
    ├── backend/
    │   ├── main.py        Servidor FastAPI + Socket.IO
    │   ├── requirements.txt
    │   ├── database/
    │   │   ├── schema.sql Estructura de las tablas
    │   │   └── seed.sql   Datos iniciales (usuarios, rutas, micros)
    │   ├── MODULO_HECTOR/ Config, JWT, bcrypt, middleware, logs de seguridad
    │   ├── MODULO_BRUNO/  Auth (login/register), pagos, tarjeta de transporte
    │   ├── MODULO_CRISTHIAN/ Rutas, paradas, Dijkstra (camino más corto)
    │   ├── MODULO_JAVIER/ GPS (Redis), historial de viajes, Socket.IO
    │   ├── MODULO_ROBERTO/ Micros, ocupación, lista de pasajeros
    │   └── MODULO_SAMUEL/ Cola de espera, ETA, notificaciones
    └── frontend/
        ├── package.json
        ├── vite.config.js Proxy: /auth, /rutas, /gps... → localhost:3000
        ├── index.html
        └── src/
            ├── App.jsx        Rutas y autenticación
            ├── index.css      Estilos globales
            ├── context/       AuthContext (JWT en localStorage)
            ├── services/      authService, gpsService, rutasService...
            ├── components/    Layout (sidebar), MapaInteractivo, Toast
            └── screens/
                ├── auth/      Login, Register
                ├── admin/     GestionUsuarios, GestionRutas, GestionMicros, Reportes
                ├── chofer/    RutaActiva, ReportarOcupacion, ReportarDesvio
                └── pasajero/  Mapa, ETA, Tarjeta, Historial, Notificaciones
```
