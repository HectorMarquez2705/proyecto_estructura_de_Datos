#pragma once
#include "GrafoParadas.h"
#include <vector>
#include <map>
#include <queue>
#include <limits>
#include <algorithm>

struct ResultadoRuta {
    std::vector<int> camino;
    double distanciaTotal;
    bool encontrado;
};

class OptimizadorRuta {
private:
    const GrafoParadas& grafo;

    ResultadoRuta dijkstra(int origen, int destino) {
        const double INF = std::numeric_limits<double>::infinity();
        std::map<int, double> dist;
        std::map<int, int> previo;
        using Par = std::pair<double, int>;
        std::priority_queue<Par, std::vector<Par>, std::greater<Par>> pq;

        for (int id : grafo.obtenerTodasParadas()) dist[id] = INF;
        dist[origen] = 0.0;
        pq.push({0.0, origen});

        while (!pq.empty()) {
            auto [d, u] = pq.top(); pq.pop();
            if (d > dist[u]) continue;
            if (u == destino) break;
            for (auto& a : grafo.obtenerVecinos(u)) {
                double alt = dist[u] + a.peso;
                if (alt < dist[a.paradaDestino]) {
                    dist[a.paradaDestino] = alt;
                    previo[a.paradaDestino] = u;
                    pq.push({alt, a.paradaDestino});
                }
            }
        }

        if (dist[destino] == INF) return {{}, 0.0, false};

        std::vector<int> camino;
        for (int v = destino; v != origen; v = previo[v]) camino.push_back(v);
        camino.push_back(origen);
        std::reverse(camino.begin(), camino.end());
        return {camino, dist[destino], true};
    }

public:
    OptimizadorRuta(const GrafoParadas& g) : grafo(g) {}

    ResultadoRuta encontrarRutaOptima(int origen, int destino) {
        return dijkstra(origen, destino);
    }

    double calcularDistancia(int origen, int destino) {
        auto r = dijkstra(origen, destino);
        return r.encontrado ? r.distanciaTotal : -1.0;
    }
};
