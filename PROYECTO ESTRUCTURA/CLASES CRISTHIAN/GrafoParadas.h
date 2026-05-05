#pragma once
#include <map>
#include <vector>

struct AristaGrafo {
    int paradaDestino;
    double peso;
};

class GrafoParadas {
private:
    std::map<int, std::vector<AristaGrafo>> listaAdyacencia;

public:
    GrafoParadas() {}

    void agregarParada(int paradaId) {
        if (listaAdyacencia.find(paradaId) == listaAdyacencia.end())
            listaAdyacencia[paradaId] = {};
    }

    void agregarArista(int origen, int destino, double peso) {
        agregarParada(origen);
        agregarParada(destino);
        listaAdyacencia[origen].push_back({destino, peso});
        listaAdyacencia[destino].push_back({origen, peso});
    }

    std::vector<AristaGrafo> obtenerVecinos(int paradaId) const {
        auto it = listaAdyacencia.find(paradaId);
        if (it == listaAdyacencia.end()) return {};
        return it->second;
    }

    bool existeParada(int paradaId) const {
        return listaAdyacencia.find(paradaId) != listaAdyacencia.end();
    }

    int getNumParadas() const { return (int)listaAdyacencia.size(); }

    std::vector<int> obtenerTodasParadas() const {
        std::vector<int> ids;
        for (auto& p : listaAdyacencia) ids.push_back(p.first);
        return ids;
    }
};
