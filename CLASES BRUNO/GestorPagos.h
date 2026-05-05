#pragma once
#include "TarjetaTransporte.h"
#include <vector>
#include <map>
#include <string>

struct Transaccion {
    int id;
    int tarjetaId;
    double monto;
    std::string tipo;
    std::string descripcion;
};

class GestorPagos {
private:
    std::map<int, TarjetaTransporte*> tarjetas;
    std::vector<Transaccion> historial;
    int nextTransaccionId;

public:
    GestorPagos() : nextTransaccionId(1) {}

    bool agregarTarjeta(TarjetaTransporte* tarjeta) {
        if (!tarjeta) return false;
        tarjetas[tarjeta->getId()] = tarjeta;
        return true;
    }

    bool recargarTarjeta(int tarjetaId, double monto) {
        auto it = tarjetas.find(tarjetaId);
        if (it == tarjetas.end()) return false;
        if (!it->second->recargar(monto)) return false;
        historial.push_back({nextTransaccionId++, tarjetaId, monto, "recarga", "Recarga de saldo"});
        return true;
    }

    bool cobrarPasaje(int tarjetaId, double monto) {
        auto it = tarjetas.find(tarjetaId);
        if (it == tarjetas.end()) return false;
        if (!it->second->cobrar(monto)) return false;
        historial.push_back({nextTransaccionId++, tarjetaId, monto, "cobro", "Cobro de pasaje"});
        return true;
    }

    double consultarSaldo(int tarjetaId) const {
        auto it = tarjetas.find(tarjetaId);
        if (it == tarjetas.end()) return -1.0;
        return it->second->getSaldo();
    }

    std::vector<Transaccion> obtenerHistorial(int tarjetaId, int limite = 5) const {
        std::vector<Transaccion> res;
        for (int i = (int)historial.size() - 1; i >= 0 && (int)res.size() < limite; i--)
            if (historial[i].tarjetaId == tarjetaId)
                res.push_back(historial[i]);
        return res;
    }
};
