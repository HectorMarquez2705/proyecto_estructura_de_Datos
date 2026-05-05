#pragma once
#include <string>
#include <sstream>

class Micro {
public:
    int id;
    std::string placa;
    int choferId;
    int rutaId;
    int capacidad;
    std::string estado;
    int pasajerosAbordo;

    Micro() : id(0), choferId(0), rutaId(0), capacidad(30),
              estado("inactivo"), pasajerosAbordo(0) {}
    Micro(int id, const std::string& placa, int choferId, int rutaId,
          int capacidad = 30)
        : id(id), placa(placa), choferId(choferId), rutaId(rutaId),
          capacidad(capacidad), estado("inactivo"), pasajerosAbordo(0) {}

    bool estaActivo() const { return estado == "activo"; }
    bool estaLleno() const  { return pasajerosAbordo >= capacidad; }

    std::string getOcupacion() const {
        double r = (double)pasajerosAbordo / capacidad;
        if (r < 0.33) return "vacio";
        if (r < 0.66) return "medio";
        return "lleno";
    }

    void activar()   { estado = "activo"; }
    void desactivar(){ estado = "inactivo"; }

    bool subirPasajero() {
        if (estaLleno()) return false;
        pasajerosAbordo++; return true;
    }

    bool bajarPasajero() {
        if (pasajerosAbordo <= 0) return false;
        pasajerosAbordo--; return true;
    }

    std::string toString() const {
        std::ostringstream ss;
        ss << "Micro{placa=" << placa << ", ruta=" << rutaId
           << ", pasajeros=" << pasajerosAbordo << "/" << capacidad
           << ", estado=" << estado << "}";
        return ss.str();
    }
};
