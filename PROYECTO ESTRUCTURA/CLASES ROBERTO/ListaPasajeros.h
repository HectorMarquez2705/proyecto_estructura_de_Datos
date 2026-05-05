#pragma once
#include <string>
#include <vector>

struct NodoPasajero {
    int usuarioId;
    std::string nombre;
    int paradaOrigen;
    NodoPasajero* siguiente;

    NodoPasajero(int id, const std::string& n, int parada)
        : usuarioId(id), nombre(n), paradaOrigen(parada), siguiente(nullptr) {}
};

class ListaPasajeros {
private:
    NodoPasajero* cabeza;
    int tamanio;

public:
    ListaPasajeros() : cabeza(nullptr), tamanio(0) {}
    ~ListaPasajeros() { limpiar(); }

    void agregarPasajero(int usuarioId, const std::string& nombre, int paradaOrigen) {
        NodoPasajero* nuevo = new NodoPasajero(usuarioId, nombre, paradaOrigen);
        nuevo->siguiente = cabeza;
        cabeza = nuevo;
        tamanio++;
    }

    bool eliminarPasajero(int usuarioId) {
        NodoPasajero* actual = cabeza;
        NodoPasajero* prev   = nullptr;
        while (actual) {
            if (actual->usuarioId == usuarioId) {
                if (prev) prev->siguiente = actual->siguiente;
                else      cabeza          = actual->siguiente;
                delete actual;
                tamanio--;
                return true;
            }
            prev = actual; actual = actual->siguiente;
        }
        return false;
    }

    bool existePasajero(int usuarioId) const {
        NodoPasajero* a = cabeza;
        while (a) { if (a->usuarioId == usuarioId) return true; a = a->siguiente; }
        return false;
    }

    int getTamanio() const { return tamanio; }

    void limpiar() {
        while (cabeza) { NodoPasajero* t = cabeza; cabeza = cabeza->siguiente; delete t; }
        tamanio = 0;
    }

    std::vector<int> obtenerIds() const {
        std::vector<int> ids;
        NodoPasajero* a = cabeza;
        while (a) { ids.push_back(a->usuarioId); a = a->siguiente; }
        return ids;
    }
};
