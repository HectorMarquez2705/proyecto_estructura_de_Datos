#pragma once
#include <map>
#include <vector>
#include <string>
#include <utility>
#include <algorithm>

struct DatoFlujo {
    int rutaId;
    int hora;
    int cantidadViajes;
    int pasajerosTotales;
};

class AnalizadorFlujo {
private:
    std::map<std::pair<int,int>, DatoFlujo> registros;
    int microsActivosCount;

public:
    AnalizadorFlujo() : microsActivosCount(0) {}

    void registrarViaje(int rutaId, int hora, int pasajeros) {
        auto clave = std::make_pair(rutaId, hora);
        if (registros.find(clave) == registros.end())
            registros[clave] = {rutaId, hora, 0, 0};
        registros[clave].cantidadViajes++;
        registros[clave].pasajerosTotales += pasajeros;
    }

    DatoFlujo obtenerFlujo(int rutaId, int hora) const {
        auto it = registros.find({rutaId, hora});
        if (it != registros.end()) return it->second;
        return {rutaId, hora, 0, 0};
    }

    std::vector<DatoFlujo> obtenerFlujoRuta(int rutaId) const {
        std::vector<DatoFlujo> res;
        for (auto& p : registros)
            if (p.first.first == rutaId) res.push_back(p.second);
        return res;
    }

    std::vector<DatoFlujo> obtenerFlujoHora(int hora) const {
        std::vector<DatoFlujo> res;
        for (auto& p : registros)
            if (p.first.second == hora) res.push_back(p.second);
        return res;
    }

    int getTotalViajes() const {
        int total = 0;
        for (auto& p : registros) total += p.second.cantidadViajes;
        return total;
    }

    void setMicrosActivos(int n) { microsActivosCount = n; }
    int getMicrosActivos() const { return microsActivosCount; }
};
