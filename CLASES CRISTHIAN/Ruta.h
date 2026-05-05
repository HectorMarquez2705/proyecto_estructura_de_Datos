#pragma once
#include <string>
#include <vector>
#include <sstream>
#include <algorithm>

class Ruta {
public:
    int id;
    std::string nombre;
    std::string descripcion;
    bool activa;
    std::vector<int> paradaIds;

    Ruta() : id(0), activa(true) {}
    Ruta(int id, const std::string& nombre, const std::string& descripcion = "")
        : id(id), nombre(nombre), descripcion(descripcion), activa(true) {}

    void agregarParada(int paradaId) { paradaIds.push_back(paradaId); }

    bool tieneParada(int paradaId) const {
        return std::find(paradaIds.begin(), paradaIds.end(), paradaId) != paradaIds.end();
    }

    int getNumParadas() const { return (int)paradaIds.size(); }
    void desactivar() { activa = false; }

    std::string toString() const {
        std::ostringstream ss;
        ss << "Ruta{id=" << id << ", nombre=" << nombre
           << ", paradas=" << paradaIds.size() << "}";
        return ss.str();
    }
};
