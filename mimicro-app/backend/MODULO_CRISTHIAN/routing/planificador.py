"""
Planificador de rutas miMicro — basado en ruta_path de cada línea.

Grafo:
  - Nodo "origen" y "destino" virtuales.
  - Un nodo por cada waypoint (lat/lng) de ruta_path de cada línea: (linea_id, wp_idx).
  - Aristas intra-línea (solo hacia adelante): (lid, i) → (lid, i+1).
  - Aristas de transferencia entre líneas distintas si la distancia entre dos
    waypoints es ≤ MAX_TRANSFER_M.
  - Aristas origen → todos los waypoints (caminata libre + espera de micro).
  - Aristas todos los waypoints → destino (caminata libre).
"""

import heapq
import math
import itertools

# ── Constantes ─────────────────────────────────────────────────
VEL_MICRO      = 20_000 / 3600   # 20 km/h → m/s
VEL_CAMINATA   =  5_000 / 3600   #  5 km/h → m/s
ESPERA_MICRO   = 5 * 60          # 5 min espera promedio (s)
MAX_TRANSFER_M = 200             # máx distancia a pie para transferir


def haversine(lat1, lng1, lat2, lng2) -> float:
    """Distancia en metros entre dos coordenadas."""
    R = 6_371_000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2) ** 2
    return 2 * R * math.asin(math.sqrt(a))


def planificar(origen: dict, destino: dict, lineas: list) -> dict:
    """
    origen   = {lat, lng}
    destino  = {lat, lng}
    lineas   = [{id, nombre, ruta_path: [{lat, lng}, ...]}, ...]

    Devuelve:
    {
      "encontrado": bool,
      "tiempo_total_seg": int,
      "tramos": [
        {
          "tipo": "caminar" | "micro",
          "descripcion": str,
          "linea_id": int | null,
          "linea_nombre": str | null,
          "desde_lat": float, "desde_lng": float,
          "hasta_lat": float, "hasta_lng": float,
          "ruta_segmento": [{lat, lng}, ...],   (solo tipo "micro")
          "distancia_m": int,
          "tiempo_seg": int,
          "micro_cercano": null,   (enriquecido por routingRoutes)
        }
      ]
    }
    """
    if not lineas:
        return {"encontrado": False, "tiempo_total_seg": 0, "tramos": []}

    ORIG = "origen"
    DEST = "destino"

    # ── Construir índice de waypoints ──────────────────────────
    # wp_map[(lid, idx)] = {"lat": float, "lng": float}
    wp_map: dict = {}
    linea_wps: dict = {}   # lid → list of {lat, lng}
    linea_nombres: dict = {}

    for l in lineas:
        ruta = l.get("ruta_path") or []
        if len(ruta) < 2:
            continue
        lid = l["id"]
        linea_nombres[lid] = l.get("nombre", str(lid))
        pts = [{"lat": float(p["lat"]), "lng": float(p["lng"])} for p in ruta]
        linea_wps[lid] = pts
        for idx, pt in enumerate(pts):
            wp_map[(lid, idx)] = pt

    if not wp_map:
        return {"encontrado": False, "tiempo_total_seg": 0, "tramos": []}

    # ── Construir grafo ────────────────────────────────────────
    graph: dict = {}

    def add_edge(u, v, cost, meta):
        graph.setdefault(u, []).append((cost, v, meta))

    # Aristas intra-línea (solo hacia adelante: i → i+1)
    for lid, pts in linea_wps.items():
        for i in range(len(pts) - 1):
            dist = haversine(pts[i]["lat"], pts[i]["lng"],
                             pts[i + 1]["lat"], pts[i + 1]["lng"])
            cost = dist / VEL_MICRO
            add_edge((lid, i), (lid, i + 1),
                     cost, {"tipo": "micro", "linea_id": lid, "dist": dist})

    # Aristas de transferencia entre líneas distintas (≤ MAX_TRANSFER_M)
    all_nodes = list(wp_map.keys())
    for ni in range(len(all_nodes)):
        (lid1, idx1) = all_nodes[ni]
        pt1 = wp_map[(lid1, idx1)]
        for nj in range(len(all_nodes)):
            (lid2, idx2) = all_nodes[nj]
            if lid1 == lid2:
                continue
            pt2 = wp_map[(lid2, idx2)]
            dist = haversine(pt1["lat"], pt1["lng"], pt2["lat"], pt2["lng"])
            if dist > MAX_TRANSFER_M:
                continue
            cost = dist / VEL_CAMINATA + ESPERA_MICRO
            add_edge((lid1, idx1), (lid2, idx2),
                     cost, {"tipo": "transferencia", "linea_id": None, "dist": dist})

    # Aristas origen → waypoints (caminata libre + espera)
    olat, olng = float(origen["lat"]), float(origen["lng"])
    for (lid, idx), pt in wp_map.items():
        dist = haversine(olat, olng, pt["lat"], pt["lng"])
        cost = dist / VEL_CAMINATA + ESPERA_MICRO
        add_edge(ORIG, (lid, idx),
                 cost, {"tipo": "caminar_origen", "linea_id": lid, "dist": dist})

    # Aristas waypoints → destino (caminata libre)
    dlat, dlng = float(destino["lat"]), float(destino["lng"])
    for (lid, idx), pt in wp_map.items():
        dist = haversine(pt["lat"], pt["lng"], dlat, dlng)
        cost = dist / VEL_CAMINATA
        add_edge((lid, idx), DEST,
                 cost, {"tipo": "caminar_destino", "linea_id": None, "dist": dist})

    # ── Dijkstra ───────────────────────────────────────────────
    _seq    = itertools.count()
    dist_to = {ORIG: 0.0}
    prev    = {}
    heap    = [(0.0, next(_seq), ORIG)]

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
            lid = node[0]
            pt  = wp_map[node]
            tramos.append({
                "tipo": "caminar",
                "descripcion": f"Caminá hasta la Línea {linea_nombres[lid]}",
                "linea_id": None,
                "linea_nombre": None,
                "desde_lat": olat, "desde_lng": olng,
                "hasta_lat": pt["lat"], "hasta_lng": pt["lng"],
                "ruta_segmento": [],
                "distancia_m": round(meta["dist"]),
                "tiempo_seg": round(meta["dist"] / VEL_CAMINATA),
                "micro_cercano": None,
            })
            i += 1

        elif tipo == "micro":
            lid = meta["linea_id"]
            # Recolectar aristas consecutivas de la misma línea
            segmento = [wp_map[parent]]
            dist_acum = meta["dist"]
            j = i
            while j < len(path):
                p2, n2, m2 = path[j]
                if m2["tipo"] != "micro" or m2["linea_id"] != lid:
                    break
                segmento.append(wp_map[n2])
                dist_acum += m2["dist"]
                j += 1

            tramos.append({
                "tipo": "micro",
                "descripcion": f"Tomá la Línea {linea_nombres[lid]}",
                "linea_id": lid,
                "linea_nombre": linea_nombres[lid],
                "desde_lat": segmento[0]["lat"],  "desde_lng": segmento[0]["lng"],
                "hasta_lat": segmento[-1]["lat"],  "hasta_lng": segmento[-1]["lng"],
                "ruta_segmento": [{"lat": p["lat"], "lng": p["lng"]} for p in segmento],
                "distancia_m": round(dist_acum),
                "tiempo_seg": round(dist_acum / VEL_MICRO),
                "micro_cercano": None,
            })
            i = j

        elif tipo == "transferencia":
            pt1 = wp_map[parent]
            pt2 = wp_map[node]
            lid2 = node[0]
            tramos.append({
                "tipo": "caminar",
                "descripcion": f"Transferí a la Línea {linea_nombres[lid2]}",
                "linea_id": None,
                "linea_nombre": None,
                "desde_lat": pt1["lat"], "desde_lng": pt1["lng"],
                "hasta_lat": pt2["lat"], "hasta_lng": pt2["lng"],
                "ruta_segmento": [],
                "distancia_m": round(meta["dist"]),
                "tiempo_seg": round(meta["dist"] / VEL_CAMINATA),
                "micro_cercano": None,
            })
            i += 1

        elif tipo == "caminar_destino":
            pt = wp_map[parent]
            tramos.append({
                "tipo": "caminar",
                "descripcion": "Caminá hasta tu destino",
                "linea_id": None,
                "linea_nombre": None,
                "desde_lat": pt["lat"], "desde_lng": pt["lng"],
                "hasta_lat": dlat, "hasta_lng": dlng,
                "ruta_segmento": [],
                "distancia_m": round(meta["dist"]),
                "tiempo_seg": round(meta["dist"] / VEL_CAMINATA),
                "micro_cercano": None,
            })
            i += 1
        else:
            i += 1

    return {
        "encontrado": True,
        "tiempo_total_seg": round(dist_to[DEST]),
        "tramos": tramos,
    }
