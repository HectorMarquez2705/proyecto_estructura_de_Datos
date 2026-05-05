# miMicro S.R.L. - Transporte Inteligente SCZ 🚍

> [cite_start]Plataforma móvil de dos lados que digitaliza el transporte público informal en Santa Cruz de la Sierra mediante tecnología *crowdsourcing* y monitoreo en tiempo real[cite: 33, 73].

---

## 👥 Equipo de Desarrollo e Integrantes

[cite_start]Este proyecto es desarrollado para la materia de **Estructura de Datos** (3er semestre 2026) en la **Universidad Privada de Santa Cruz de la Sierra (UPSA)**[cite: 1, 13].

| Nombre completo | Registro | Responsabilidad Técnica / Clases |
| :--- | :--- | :--- |
| **Hector Marquez** | 2025111291 | Analizador de Flujo, `main.cpp`, Reporte de seguridad, encriptación |
| **Bruno Parada** | 2025113242 | Gestor De Pagos, Persona, Tarjeta de Transporte |
| **Cristhian Arze** | 2025114451 | Grafo de Paradas, Optimizador de Ruta, Ruta |
| **Javier Caye** | 2025111797 | Gestor de GPS, Parada, Pila-Historial |
| **Roberto Gutierrez** | 2025111916 | Lista de Pasajeros, Micro, Sensor de Puerta |
| **Samuel Carrasco** | 2025211490 | Cola de Espera, Notificación de Alerta, Tiempo Estimado |

---

## ❗ El Problema Identificado
[cite_start]El transporte público en Santa Cruz de la Sierra presenta deficiencias críticas que afectan a miles de usuarios diariamente[cite: 36]:
* [cite_start]**Incertidumbre total:** El usuario desconoce cuándo llegará la siguiente unidad o si tiene espacio disponible[cite: 38].
* [cite_start]**Cambios de ruta:** Los conductores alteran recorridos por tráfico o decisiones propias sin aviso previo[cite: 39].
* [cite_start]**Pagos ineficientes:** El uso de efectivo genera conflictos por cambio y riesgos de robo[cite: 41].
* [cite_start]**Vacío tecnológico:** Aplicaciones globales como Google Maps no cubren adecuadamente las rutas informales locales[cite: 46].

---

## 🚀 Solución: miMicro
[cite_start]miMicro adopta un enfoque incremental basado en tres pilares metodológicos[cite: 57]:

### 1. Crowdsourcing Pasivo
[cite_start]Inspirado en modelos como Waze, utiliza la ubicación GPS anonimizada de los pasajeros para inferir la posición de los vehículos, velocidad del tráfico y nivel de ocupación sin depender inicialmente de hardware en los micros[cite: 58, 60, 136].

### 2. Monitoreo Inteligente
* [cite_start]**Cálculo de ETA:** Algoritmos que cruzan la distancia actual con la velocidad promedio y factores de tráfico[cite: 156].
* [cite_start]**Gestión de Ocupación:** Clasificación del estado de carga del vehículo (Vacío, Medio, Lleno) basada en reportes de la comunidad[cite: 158].

### 3. Estrategia por Fases
* [cite_start]**Fase 1 (Beta):** Lanzamiento en universidades y tracking por usuarios[cite: 70].
* [cite_start]**Fase 2 (Expansión):** Integración con choferes y cobertura del 60% de rutas principales[cite: 70].
* [cite_start]**Fase 3 (Monetización):** Implementación de pagos QR y venta de datos de movilidad al municipio[cite: 70, 126].

---

## 🛠️ Arquitectura y Estructuras de Datos
[cite_start]El sistema organiza la información a través de entidades relacionales diseñadas para la escalabilidad[cite: 114]:

* [cite_start]**Usuario:** Control de acceso por roles (Pasajero, Operador, Administrador)[cite: 83, 116].
* [cite_start]**Ruta:** Base de datos de trayectos oficiales con coordenadas geográficas[cite: 118].
* [cite_start]**Vehículo:** Registro de unidades vinculadas a operadores y rutas específicas[cite: 120].
* [cite_start]**Posición en Tiempo Real:** Registro constante de coordenadas y fuente del dato (chofer/usuario)[cite: 122].

---

## ⚙️ Instalación y Ejecución

Para configurar el entorno de desarrollo local y acceder al repositorio:

```bash
# 1. Clonar el repositorio
git clone [https://github.com/HectorMarquez2705/proyecto_estructura_de_Datos.git](https://github.com/HectorMarquez2705/proyecto_estructura_de_Datos.git)

# 2. Entrar a la carpeta del proyecto
cd "PROYECTO ESTRUCTURA"

# 3. Compilación (Ejemplo para C++)
# El proyecto utiliza estructuras de datos como Pilas, Colas y Grafos
g++ main.cpp -o miMicro
./miMicro