"""
Dijkstra multi-línea para miMicro.

Grafo:
  - Nodo "origen"  y nodo "destino" virtuales.
  - Un nodo por cada parada real (paradas_linea).
  - Aristas dentro de la misma línea: tiempo de viaje = distancia / VEL_MICRO.
  - Aristas de transferencia entre paradas de distintas líneas
    si la distancia entre ellas es ≤ MAX_TRANSFER_M:
    tiempo = distancia / VEL_CAMINATA + ESPERA_MICRO.
  - Aristas origen→paradas y paradas→destino:
    tiempo = distancia a pie / VEL_CAMINATA.
"""

import heapq
import math
import itertools

# ── Constantes ─────────────────────────────────────────────────
VEL_MICRO     = 20_000 / 3600   # 20 km/h → m/s
VEL_CAMINATA  =  5_000 / 3600   #  5 km/h → m/s
ESPERA_MICRO  = 5 * 60          # 5 min espera promedio (segundos)
MAX_TRANSFER_M = 400            # máx distancia para transferencia a pie
MAX_WALK_ORIGEN = 800           # máx distancia a pie para llegar a 1era parada


def haversine(lat1, lng1, lat2, lng2) -> float:
    """Distancia en metros entre dos coordenadas."""
    R = 6_371_000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2) ** 2
    return 2 * R * math.asin(math.sqrt(a))


def planificar(origen: dict, destino: dict, paradas: list) -> dict:
    """
    origen  = {lat, lng}
    destino = {lat, lng}
    paradas = [{id, linea_id, nombre, lat, lng, orden}, ...]

    Devuelve:
    {
      "encontrado": bool,
      "tiempo_total_seg": int,
      "tramos": [
        {
          "tipo": "caminar" | "micro",
          "descripcion": str,
          "linea_id": int | null,
          "desde": str,
          "hasta": str,
          "distancia_m": float,
          "tiempo_seg": int,
          "paradas_recorridas": [ {id, nombre, lat, lng} ]
        }
      ]
    }
    """
    if not paradas:
        return {"encontrado": False, "tiempo_total_seg": 0, "tramos": []}

    # Nodos especiales
    ORIG = "origen"
    DEST = "destino"

    # ── Construir grafo ────────────────────────────────────────
    # graph[nodo] = [(costo_seg, nodo_vecino, metadata)]
    graph: dict[str, list] = {}

    def add_edge(u, v, cost, meta):
        graph.setdefault(u, []).append((cost, v, meta))

    # Indexar paradas por id y por línea
    por_id  = {p["id"]: p for p in paradas}
    por_linea: dict[int, list] = {}
    for p in paradas:
        por_linea.setdefault(p["linea_id"], []).append(p)
    for lid in por_linea:
        por_linea[lid].sort(key=lambda x: (x["orden"], x["id"]))

    # Aristas dentro de cada línea (bidireccionales)
    for lid, stops in por_linea.items():
        for i in range(len(stops) - 1):
            a, b = stops[i], stops[i + 1]
            dist = haversine(a["lat"], a["lng"], b["lat"], b["lng"])
            cost = dist / VEL_MICRO
            meta_ab = {"tipo": "micro", "linea_id": lid, "dist": dist}
            meta_ba = {"tipo": "micro", "linea_id": lid, "dist": dist}
            add_edge(a["id"], b["id"], cost, meta_ab)
            add_edge(b["id"], a["id"], cost, meta_ba)

    # Aristas de transferencia entre paradas de distintas líneas
    ids = list(por_id.keys())
    for i in range(len(ids)):
        for j in range(i + 1, len(ids)):
            pa, pb = por_id[ids[i]], por_id[ids[j]]
            if pa["linea_id"] == pb["linea_id"]:
                continue
            dist = haversine(pa["lat"], pa["lng"], pb["lat"], pb["lng"])
            if dist > MAX_TRANSFER_M:
                continue
            cost = dist / VEL_CAMINATA + ESPERA_MICRO
            meta = {"tipo": "transferencia", "linea_id": None, "dist": dist}
            add_edge(pa["id"], pb["id"], cost, meta)
            add_edge(pb["id"], pa["id"], cost, meta)

    # Aristas origen → paradas cercanas
    for p in paradas:
        dist = haversine(origen["lat"], origen["lng"], p["lat"], p["lng"])
        if dist > MAX_WALK_ORIGEN:
            continue
        cost = dist / VEL_CAMINATA + ESPERA_MICRO
        meta = {"tipo": "caminar_origen", "linea_id": p["linea_id"], "dist": dist}
        add_edge(ORIG, p["id"], cost, meta)

    # Aristas paradas → destino
    for p in paradas:
        dist = haversine(p["lat"], p["lng"], destino["lat"], destino["lng"])
        cost = dist / VEL_CAMINATA
        meta = {"tipo": "caminar_destino", "linea_id": None, "dist": dist}
        add_edge(p["id"], DEST, cost, meta)

    # ── Dijkstra ───────────────────────────────────────────────
    # El contador evita que heapq compare nodos (str vs int) cuando
    # dos costos son iguales — eso lanzaría TypeError en Python 3.
    _seq     = itertools.count()
    dist_to  = {ORIG: 0.0}
    prev     = {}   # nodo → (nodo_anterior, metadata)
    heap     = [(0.0, next(_seq), ORIG)]

    while heap:
        d, _, u = heapq.heappop(heap)
        if d > dist_to.get(u, math.inf):
            continue
        for cost, v, meta in graph.get(u, []):
            nd = d + cost
            if nd < dist_to.get(v, math.inf):
                dist_to[v] = nd
                prev[v] = (u, meta)
                heapq.heappush(heap, (nd, next(_seq), v))

    if DEST not in dist_to:
        return {"encontrado": False, "tiempo_total_seg": 0, "tramos": []}

    # ── Reconstruir camino ─────────────────────────────────────
    path = []
    node = DEST
    while node in prev:
        parent, meta = prev[node]
        path.append((parent, node, meta))
        node = parent
    path.reverse()

    # ── Agrupar en tramos legibles ─────────────────────────────
    tramos = []
    i = 0
    while i < len(path):
        parent, node, meta = path[i]
        tipo = meta["tipo"]

        if tipo == "caminar_origen":
            p = por_id[node]
            tramos.append({
                "tipo": "caminar",
                "descripcion": f"Caminá hasta la parada '{p['nombre']}'",
                "linea_id": None,
                "desde": "Tu ubicación",
                "hasta": p["nombre"],
                "distancia_m": round(meta["dist"]),
                "tiempo_seg": round(meta["dist"] / VEL_CAMINATA),
                "paradas_recorridas": [],
            })
            i += 1

        elif tipo == "micro":
            linea_id = meta["linea_id"]
            paradas_tramo = []
            # el nodo de inicio de este segmento de micro
            inicio_id = parent if parent != ORIG else node
            paradas_tramo.append(por_id[inicio_id])

            dist_acum = meta["dist"]
            j = i
            while j < len(path):
                p2, n2, m2 = path[j]
                if m2["tipo"] != "micro" or m2["linea_id"] != linea_id:
                    break
                paradas_tramo.append(por_id[n2])
                dist_acum += m2["dist"]
                j += 1

            nombre_desde = paradas_tramo[0]["nombre"]
            nombre_hasta = paradas_tramo[-1]["nombre"]
            tramos.append({
                "tipo": "micro",
                "descripcion": f"Tomá la Línea {linea_id} de '{nombre_desde}' a '{nombre_hasta}'",
                "linea_id": linea_id,
                "desde": nombre_desde,
                "hasta": nombre_hasta,
                "distancia_m": round(dist_acum),
                "tiempo_seg": round(dist_acum / VEL_MICRO),
                "paradas_recorridas": [
                    {"id": p["id"], "nombre": p["nombre"],
                     "lat": float(p["lat"]), "lng": float(p["lng"])}
                    for p in paradas_tramo
                ],
            })
            i = j

        elif tipo == "transferencia":
            pa = por_id[parent]
            pb = por_id[node]
            tramos.append({
                "tipo": "caminar",
                "descripcion": f"Caminá de '{pa['nombre']}' a '{pb['nombre']}' para transferir",
                "linea_id": None,
                "desde": pa["nombre"],
                "hasta": pb["nombre"],
                "distancia_m": round(meta["dist"]),
                "tiempo_seg": round(meta["dist"] / VEL_CAMINATA),
                "paradas_recorridas": [],
            })
            i += 1

        elif tipo == "caminar_destino":
            p = por_id[parent] if parent != ORIG else None
            nombre_desde = p["nombre"] if p else "Tu ubicación"
            tramos.append({
                "tipo": "caminar",
                "descripcion": "Caminá hasta tu destino",
                "linea_id": None,
                "desde": nombre_desde,
                "hasta": "Tu destino",
                "distancia_m": round(meta["dist"]),
                "tiempo_seg": round(meta["dist"] / VEL_CAMINATA),
                "paradas_recorridas": [],
            })
            i += 1
        else:
            i += 1

    return {
        "encontrado": True,
        "tiempo_total_seg": round(dist_to[DEST]),
        "tramos": tramos,
    }
