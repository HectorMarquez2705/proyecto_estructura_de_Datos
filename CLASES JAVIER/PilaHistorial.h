#pragma once
#include <stack>
#include <vector>
#include <string>

struct RegistroViaje {
    int usuarioId;
    int microId;
    int paradaOrigenId;
    int paradaDestinoId;
    std::string fecha;
    double costo;
};

class PilaHistorial {
private:
    std::stack<RegistroViaje> pila;
    int maxTamanio;

public:
    PilaHistorial(int maxTamanio = 100) : maxTamanio(maxTamanio) {}

    void agregarViaje(const RegistroViaje& viaje) {
        if ((int)pila.size() >= maxTamanio) {
            std::vector<RegistroViaje> temp;
            while (!pila.empty()) { temp.push_back(pila.top()); pila.pop(); }
            temp.pop_back();
            for (int i = (int)temp.size()-1; i >= 0; i--) pila.push(temp[i]);
        }
        pila.push(viaje);
    }

    RegistroViaje obtenerUltimo() const {
        if (pila.empty()) return {0, 0, 0, 0, "", 0.0};
        return pila.top();
    }

    bool estaVacia() const { return pila.empty(); }
    int getTamanio() const { return (int)pila.size(); }

    std::vector<RegistroViaje> obtenerTodos() const {
        std::vector<RegistroViaje> res;
        std::stack<RegistroViaje> tmp = pila;
        while (!tmp.empty()) { res.push_back(tmp.top()); tmp.pop(); }
        return res;
    }

    void limpiar() { pila = std::stack<RegistroViaje>(); }
};
