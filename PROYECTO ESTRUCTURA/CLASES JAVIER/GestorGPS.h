#pragma once
#include <map>
#include <vector>

struct PosicionGPS {
    int microId;
    double lat;
    double lng;
    long long timestamp;
    double velocidad;
};

class GestorGPS {
private:
    std::map<int, PosicionGPS> posicionesActivas;

public:
    GestorGPS() {}

    void actualizarPosicion(const PosicionGPS& pos) {
        posicionesActivas[pos.microId] = pos;
    }

    PosicionGPS obtenerPosicion(int microId) const {
        auto it = posicionesActivas.find(microId);
        if (it != posicionesActivas.end()) return it->second;
        return {microId, 0.0, 0.0, 0LL, 0.0};
    }

    bool microActivo(int microId) const {
        return posicionesActivas.find(microId) != posicionesActivas.end();
    }

    void eliminarMicro(int microId) { posicionesActivas.erase(microId); }

    std::vector<PosicionGPS> obtenerTodas() const {
        std::vector<PosicionGPS> res;
        for (auto& p : posicionesActivas) res.push_back(p.second);
        return res;
    }

    int contarActivos() const { return (int)posicionesActivas.size(); }
};
