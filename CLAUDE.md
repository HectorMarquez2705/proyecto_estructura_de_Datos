# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**miMicro** — an intelligent public transport platform for Santa Cruz de la Sierra (Bolivia). It's a C++ Data Structures course project (3rd semester 2026, UPSA) built by a 6-person team. The system uses crowdsourced GPS from passengers to infer vehicle positions, calculate ETAs, and track occupancy.

## Build

No build system is configured. Compile directly from the `PROYECTO ESTRUCTURA/CLASES HECTOR/` directory where `main.cpp` lives:

```bash
g++ main.cpp -o miMicro -std=c++17
./miMicro
```

VS Code IntelliSense is configured for MSVC (windows-msvc-x64, C++17) via `.vscode/c_cpp_properties.json`.

## Architecture

All source lives under `PROYECTO ESTRUCTURA/`. Each team member owns a subdirectory of `.h` header files. `main.cpp` (in `CLASES HECTOR/`) is the integration point — it includes all other headers.

### Team directories and responsibilities

| Directory | Owner | Domain |
|---|---|---|
| `CLASES HECTOR/` | Hector Marquez | `main.cpp` entry point, flow analysis (`Analizador_Flujo_Hector.h`), security reporting (`Reporte_Seguridad_Hector.h`) |
| `CLASES BRUNO/` | Bruno Parada | User/person model (`persona.h`), transport card (`TarjetaTransporte.h`), payment manager (`GestorPagos.h`) |
| `CLASES CRISTHIAN/` | Cristhian Arze | Stop graph (`GrafoParadas.h`), route (`Ruta.h`), route optimizer (`OptimizadorRuta.h`) |
| `CLASES JAVIER/` | Javier Caye | Stop/station (`Parada.h`), history stack (`PilaHistorial.h`), GPS manager (`GestorGPS.h`) |
| `CLASES ROBERTO/` | Roberto Gutierrez | Microbus vehicle (`Micro.h`), door sensor (`SensorPuerta.h`), passenger list (`ListaPasajeros.h`) |
| `CLASES SAMUEL/` | Samuel Carrasco | Wait queue (`ColaEspera.h`), ETA (`TiempoEstimado.h`), alert notifications (`NotificacionAlerta.h`) |

### Data structures used

- **Stack** (`PilaHistorial`) — route/location history per user
- **Queue** (`ColaEspera`) — passenger wait queue at stops
- **Graph** (`GrafoParadas`, `OptimizadorRuta`) — stop network for route finding
- **Linked list** (`ListaPasajeros`) — passenger roster per vehicle

### Key relationships

`GestorGPS` collects positions → feeds `Analizador_Flujo_Hector` and `TiempoEstimado` → `NotificacionAlerta` pushes ETAs to users. `GrafoParadas` + `OptimizadorRuta` compute routes between `Parada` nodes. `Micro` aggregates `SensorPuerta` (occupancy) and `ListaPasajeros`. Payments flow through `persona` → `TarjetaTransporte` → `GestorPagos`.

## Conventions

- All class definitions are in `.h` header files — no separate `.cpp` implementation files.
- Each developer works only in their own `CLASES <NAME>/` directory; `main.cpp` includes across directories.
- Language: Spanish is used for comments, variable names, and class names (matching the team's native language).
- Standard: C++17, no external dependencies — standard library only.
