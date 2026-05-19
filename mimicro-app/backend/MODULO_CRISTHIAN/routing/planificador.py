"""
Planificador de rutas miMicro — basado en ruta_path de cada línea.

Grafo:
  - Nodo "origen" y "destino" virtuales.
  - Un nodo por cada waypoint (lat/lng) de ruta_path de cada línea: (linea_id, wp_idx).
  - Aristas intra-línea (solo hacia adelante): (lid, i) → (lid, i+1).
  - Aristas de transferencia entre líneas distintas si la distancia entre dos
    waypoints es ≤ MAX_TRANSFER_M.
  - Aristas origen → todos los waypoints (caminata libre + espera de micro).
  - Aristas waypoints → destino (caminata libre desde waypoint exacto).
  - Aristas segmento → destino via punto proyectado: por cada segmento (i, i+1)
    se proyecta el destino sobre la recta del segmento; si la proyección cae en
    el interior (0 < t < 1) se agrega una arista desde wp[i] al destino con
    costo micro(wp[i]→proj) + caminar(proj→dest). Esto permite salir de la ruta
    en el punto más cercano al destino, no solo en waypoints exactos.
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


def proyectar_en_segmento(p_lat, p_lng, a_lat, a_lng, b_lat, b_lng):
    """
    Proyecta el punto P sobre el segmento A→B usando coordenadas planas
    (válido para distancias cortas dentro de una ciudad).

    Devuelve (t, proj_lat, proj_lng) donde t ∈ [0, 1]:
      t = 0  → proyección coincide con A
      t = 1  → proyección coincide con B
      0<t<1  → proyección cae en el interior del segmento
    """
    dx = b_lng - a_lng
    dy = b_lat - a_lat
    seg_sq = dx * dx + dy * dy
    if seg_sq < 1e-14:
        return 0.0, a_lat, a_lng
    t = ((p_lng - a_lng) * dx + (p_lat - a_lat) * dy) / seg_sq
    t = max(0.0, min(1.0, t))
    return t, a_lat + t * dy, a_lng + t * dx


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
    wp_map: dict = {}
    linea_wps: dict = {}
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

    # ── Solución 4: aristas origen → segmento via punto proyectado ──
    # Simétrico a la Solución 2 (destino proyectado) pero para el punto de subida.
    # Para cada segmento (pts[i], pts[i+1]), se proyecta el origen sobre la recta.
    # Si cae en el interior (0 < t < 1), el pasajero puede subir en ese punto exacto
    # en vez de caminar hasta el waypoint más cercano.
    # El costo es: caminar(origen→proj) + espera + micro(proj→pts[i+1])
    # La arista va a (lid, i+1) porque desde ahí continúan las aristas intra-línea.
    for lid, pts in linea_wps.items():
        for i in range(len(pts) - 1):
            t, proj_lat, proj_lng = proyectar_en_segmento(
                olat, olng,
                pts[i]["lat"],     pts[i]["lng"],
                pts[i + 1]["lat"], pts[i + 1]["lng"],
            )
            if t <= 0.0 or t >= 1.0:
                continue
            dist_walk  = haversine(olat, olng, proj_lat, proj_lng)
            dist_micro = haversine(proj_lat, proj_lng, pts[i + 1]["lat"], pts[i + 1]["lng"])
            cost = dist_walk / VEL_CAMINATA + ESPERA_MICRO + dist_micro / VEL_MICRO
            add_edge(ORIG, (lid, i + 1), cost, {
                "tipo":       "caminar_origen_proyectado",
                "linea_id":   lid,
                "proj_lat":   proj_lat,
                "proj_lng":   proj_lng,
                "dist_walk":  dist_walk,
                "dist_micro": dist_micro,
            })

    # Aristas waypoints → destino (caminata desde waypoint exacto)
    dlat, dlng = float(destino["lat"]), float(destino["lng"])
    for (lid, idx), pt in wp_map.items():
        dist = haversine(pt["lat"], pt["lng"], dlat, dlng)
        cost = dist / VEL_CAMINATA
        add_edge((lid, idx), DEST,
                 cost, {"tipo": "caminar_destino", "linea_id": None, "dist": dist})

    # ── Solución 2: aristas segmento → destino via punto proyectado ──
    # Para cada segmento (pts[i], pts[i+1]) de cada línea, se proyecta el destino
    # sobre la recta del segmento. Si la proyección cae en el interior (0 < t < 1),
    # se agrega una arista desde (lid, i) hacia DEST cuyo costo es:
    #   micro(pts[i] → proj) + caminar(proj → destino)
    # Esto permite al Dijkstra elegir el punto exacto de bajada más cercano
    # al destino, aunque no coincida con ningún waypoint del admin.
    for lid, pts in linea_wps.items():
        for i in range(len(pts) - 1):
            t, proj_lat, proj_lng = proyectar_en_segmento(
                dlat, dlng,
                pts[i]["lat"],     pts[i]["lng"],
                pts[i + 1]["lat"], pts[i + 1]["lng"],
            )
            if t <= 0.0 or t >= 1.0:
                continue  # extremos ya cubiertos por las aristas de waypoints
            dist_micro = haversine(pts[i]["lat"], pts[i]["lng"], proj_lat, proj_lng)
            dist_walk  = haversine(proj_lat, proj_lng, dlat, dlng)
            cost = dist_micro / VEL_MICRO + dist_walk / VEL_CAMINATA
            add_edge((lid, i), DEST, cost, {
                "tipo":      "caminar_destino_proyectado",
                "linea_id":  lid,
                "proj_lat":  proj_lat,
                "proj_lng":  proj_lng,
                "dist_micro": dist_micro,
                "dist":      dist_walk,
            })

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

        elif tipo == "caminar_origen_proyectado":
            # El pasajero camina hasta el punto proyectado sobre el segmento,
            # sube al micro ahí y continúa hacia el siguiente waypoint.
            lid      = meta["linea_id"]
            proj_lat = meta["proj_lat"]
            proj_lng = meta["proj_lng"]

            tramos.append({
                "tipo": "caminar",
                "descripcion": f"Caminá hasta la Línea {linea_nombres[lid]}",
                "linea_id": None,
                "linea_nombre": None,
                "desde_lat": olat, "desde_lng": olng,
                "hasta_lat": proj_lat, "hasta_lng": proj_lng,
                "ruta_segmento": [],
                "distancia_m": round(meta["dist_walk"]),
                "tiempo_seg": round(meta["dist_walk"] / VEL_CAMINATA),
                "micro_cercano": None,
            })

            # Recolectar micro desde el punto proyectado de subida
            segmento  = [{"lat": proj_lat, "lng": proj_lng}, wp_map[node]]
            dist_acum = meta["dist_micro"]
            j = i + 1
            while j < len(path):
                p2, n2, m2 = path[j]
                if m2["tipo"] != "micro" or m2["linea_id"] != lid:
                    break
                segmento.append(wp_map[n2])
                dist_acum += m2["dist"]
                j += 1

            # Peek: ¿el siguiente edge es salida proyectada al destino?
            if j < len(path):
                p2, n2, m2 = path[j]
                if m2["tipo"] == "caminar_destino_proyectado" and m2["linea_id"] == lid:
                    segmento.append({"lat": m2["proj_lat"], "lng": m2["proj_lng"]})
                    dist_acum += m2["dist_micro"]
                    tramos.append({
                        "tipo": "micro",
                        "descripcion": f"Tomá la Línea {linea_nombres[lid]}",
                        "linea_id": lid,
                        "linea_nombre": linea_nombres[lid],
                        "desde_lat": segmento[0]["lat"], "desde_lng": segmento[0]["lng"],
                        "hasta_lat": segmento[-1]["lat"], "hasta_lng": segmento[-1]["lng"],
                        "ruta_segmento": [{"lat": p["lat"], "lng": p["lng"]} for p in segmento],
                        "distancia_m": round(dist_acum),
                        "tiempo_seg": round(dist_acum / VEL_MICRO),
                        "micro_cercano": None,
                    })
                    tramos.append({
                        "tipo": "caminar",
                        "descripcion": "Caminá hasta tu destino",
                        "linea_id": None,
                        "linea_nombre": None,
                        "desde_lat": m2["proj_lat"], "desde_lng": m2["proj_lng"],
                        "hasta_lat": dlat, "hasta_lng": dlng,
                        "ruta_segmento": [],
                        "distancia_m": round(m2["dist"]),
                        "tiempo_seg": round(m2["dist"] / VEL_CAMINATA),
                        "micro_cercano": None,
                    })
                    i = j + 1
                    continue

            tramos.append({
                "tipo": "micro",
                "descripcion": f"Tomá la Línea {linea_nombres[lid]}",
                "linea_id": lid,
                "linea_nombre": linea_nombres[lid],
                "desde_lat": segmento[0]["lat"], "desde_lng": segmento[0]["lng"],
                "hasta_lat": segmento[-1]["lat"], "hasta_lng": segmento[-1]["lng"],
                "ruta_segmento": [{"lat": p["lat"], "lng": p["lng"]} for p in segmento],
                "distancia_m": round(dist_acum),
                "tiempo_seg": round(dist_acum / VEL_MICRO),
                "micro_cercano": None,
            })
            i = j

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

            # ── Solución 3: peek al siguiente edge ────────────
            # Si el Dijkstra eligió salir vía un punto proyectado en el segmento,
            # extendemos el ruta_segmento hasta ese punto exacto y generamos
            # la caminata final desde el punto proyectado al destino.
            if j < len(path):
                p2, n2, m2 = path[j]
                if m2["tipo"] == "caminar_destino_proyectado" and m2["linea_id"] == lid:
                    segmento.append({"lat": m2["proj_lat"], "lng": m2["proj_lng"]})
                    dist_acum += m2["dist_micro"]
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
                    tramos.append({
                        "tipo": "caminar",
                        "descripcion": "Caminá hasta tu destino",
                        "linea_id": None,
                        "linea_nombre": None,
                        "desde_lat": m2["proj_lat"], "desde_lng": m2["proj_lng"],
                        "hasta_lat": dlat, "hasta_lng": dlng,
                        "ruta_segmento": [],
                        "distancia_m": round(m2["dist"]),
                        "tiempo_seg": round(m2["dist"] / VEL_CAMINATA),
                        "micro_cercano": None,
                    })
                    i = j + 1
                    continue  # ya creamos ambos tramos, saltar al siguiente

            # Caso normal: el Dijkstra salió en un waypoint exacto
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

        elif tipo == "caminar_destino_proyectado":
            # Alcanzado directamente sin micro previo (caso marginal)
            tramos.append({
                "tipo": "caminar",
                "descripcion": "Caminá hasta tu destino",
                "linea_id": None,
                "linea_nombre": None,
                "desde_lat": meta["proj_lat"], "desde_lng": meta["proj_lng"],
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
