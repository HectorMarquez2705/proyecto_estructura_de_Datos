# 🚍 SmartMicro

> Aplicación inteligente para visualizar rutas, ubicación en tiempo real y tiempos de llegada del transporte público en Santa Cruz, Bolivia.

---

## 👥 Integrantes

| Nombre completo | Carnet / ID | Clases asignadas |
|----------------|-------------|-----------------|
| Integrante 1 | 2025-0001 | Usuario, Pago, Notificación |
| Integrante 2 | 2025-0002 | Micro, Conductor, Ruta |
| Integrante 3 | 2025-0003 | Viaje, Parada, Ubicación |
| Integrante 4 | 2025-0004 | Usuario, Ruta, Viaje |
| Integrante 5 | 2025-0005 | Micro, Pago, Ubicación |
| Integrante 6 | 2025-0006 | Conductor, Parada, Notificación |

**Materia:** Estructura de Datos  
**Docente:** Karem Infantas 
**Universidad:** Univesidad Privada De Santa Cruz De La Sierra 
**Semestre:** 3er semestre 2026  

---

## 📋 Descripción

SmartMicro es una aplicación móvil/web diseñada para mejorar la experiencia del transporte público en Santa Cruz, Bolivia. Permite a los usuarios visualizar rutas de micros, consultar tiempos de llegada en tiempo real, seguir la ubicación de los vehículos y optimizar sus desplazamientos diarios.

El objetivo principal es reducir la incertidumbre y el tiempo de espera, brindando información precisa y accesible tanto para pasajeros como para conductores.

---

## ❗ Problema que Resuelve

El sistema de micros en Santa Cruz presenta varias dificultades:

- Falta de información en tiempo real
- Incertidumbre sobre rutas y tiempos de llegada
- Dificultad para planificar viajes
- Desorganización en paradas y recorridos

SmartMicro busca digitalizar y optimizar este sistema.

---

## 🚀 Características principales

- 📍 Ubicación en tiempo real de los micros
- 🗺️ Consulta de rutas disponibles
- ⏱️ Estimación de tiempos de llegada
- 🛑 Visualización de paradas cercanas
- 🔔 Notificaciones importantes para usuarios
- 💳 Integración de pagos digitales *(en desarrollo futuro)*

---

## 👤 Usuarios del Sistema

| Tipo | Descripción |
|------|-------------|
| **Pasajero** | Consulta rutas, tiempos y ubicación de micros |
| **Conductor** | Actualiza su ubicación y estado en tiempo real |
| **Administrador** | Gestiona rutas, micros y datos del sistema |

---

## 🧱 Arquitectura del Sistema (POO)

El sistema está desarrollado bajo el paradigma de **Programación Orientada a Objetos**, estructurado en las siguientes clases:

| Clase | Responsabilidad |
|-------|----------------|
| `Usuario` | Gestión de datos y acceso del pasajero |
| `Conductor` | Información y estado del conductor |
| `Micro` | Datos del vehículo y su recorrido |
| `Ruta` | Definición del trayecto y paradas |
| `Parada` | Puntos de ascenso y descenso |
| `Viaje` | Registro de trayectos realizados |
| `Pago` | Gestión de transacciones |
| `Ubicación` | Coordenadas GPS en tiempo real |
| `Notificación` | Alertas y avisos al usuario |

### 🔗 Relaciones entre clases

- Un `Usuario` puede consultar múltiples `Viajes`
- Un `Micro` pertenece a una `Ruta`
- Una `Ruta` contiene varias `Paradas`
- Un `Viaje` utiliza datos de `Ubicación` en tiempo real
- Un `Usuario` puede realizar `Pagos`
- El sistema envía `Notificaciones` a los usuarios

---

## 🛠️ Tecnologías utilizadas

- **Lenguaje:** C++ / Java / Kotlin *(por definir según implementación)*
- **Base de datos:** MySQL / Firebase
- **APIs externas:** Google Maps API *(geolocalización)*

---

## ⚙️ Instalación y ejecución

> *(Esta sección se completará una vez definida la tecnología de implementación)*

```bash
# 1. Clonar el repositorio
git clone https://github.com/HectorMarquez2705/proyecto_estructura_de_Datos.git

# 2. Entrar a la carpeta
cd PROYECTO ESTRUCTURA

# 3. Instalar dependencias y ejecutar
# (agregar comandos según el lenguaje elegido)
```

---

## 📁 Estructura del proyecto

```
smartmicro/
│
├── src/
│   ├── models/        # Clases del sistema (Usuario, Micro, Ruta, etc.)
│   ├── controllers/   # Lógica de negocio
│   └── views/         # Interfaz de usuario
│
├── database/          # Scripts y esquemas de base de datos
├── docs/              # Documentación, diagramas UML
├── tests/             # Pruebas unitarias
├── README.md
└── .gitignore
```

---

## 🔮 Futuras Mejoras

- Integración con pagos QR
- Sistema de calificación de conductores
- Inteligencia artificial para predicción de tiempos
- Optimización de rutas en tiempo real

---

## 📊 Impacto Esperado

- Reducción del tiempo de espera en paradas
- Mejor organización del transporte público
- Mayor comodidad para los usuarios
- Modernización del sistema de micros en Santa Cruz

---

## 📌 Estado del Proyecto

🟡 **En desarrollo** — Fase académica (TecnoUPSA)

---

## 📝 Licencia

Este proyecto fue desarrollado con fines académicos para la materia de **Programación Orientada a Objetos** en TecnoUPSA.  
© 2025 — Todos los derechos reservados a los autores.
