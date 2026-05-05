#pragma once
#include <queue>
#include <string>

struct PasajeroEspera {
    int usuarioId;
    int paradaId;
    std::string timestamp;
    int rutaId;
};

class ColaEspera {
private:
    std::queue<PasajeroEspera> cola;
    int paradaId;

public:
    ColaEspera(int paradaId) : paradaId(paradaId) {}

    void agregarPasajero(const PasajeroEspera& pasajero) {
        cola.push(pasajero);
    }

    PasajeroEspera atenderPasajero() {
        if (cola.empty()) return {0, 0, "", 0};
        PasajeroEspera p = cola.front();
        cola.pop();
        return p;
    }

    bool estaVacia() const { return cola.empty(); }
    int getTamanio() const { return (int)cola.size(); }
    int getParadaId() const { return paradaId; }
};
