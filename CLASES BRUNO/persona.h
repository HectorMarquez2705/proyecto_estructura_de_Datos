#pragma once
#include <string>
#include <sstream>

class Persona {
public:
    int id;
    std::string nombre;
    std::string email;
    std::string passwordHash;
    std::string rol;
    std::string telefono;

    Persona() : id(0) {}
    Persona(int id, const std::string& nombre, const std::string& email,
            const std::string& passwordHash, const std::string& rol,
            const std::string& telefono = "")
        : id(id), nombre(nombre), email(email),
          passwordHash(passwordHash), rol(rol), telefono(telefono) {}

    int getId() const { return id; }
    std::string getNombre() const { return nombre; }
    std::string getEmail() const { return email; }
    std::string getRol() const { return rol; }

    bool esAdmin() const { return rol == "admin"; }
    bool esChofer() const { return rol == "chofer"; }
    bool esPasajero() const { return rol == "pasajero"; }

    std::string toString() const {
        std::ostringstream ss;
        ss << "Persona{id=" << id << ", nombre=" << nombre << ", rol=" << rol << "}";
        return ss.str();
    }
};
