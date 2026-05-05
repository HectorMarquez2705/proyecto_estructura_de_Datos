#pragma once
#include <string>
#include <sstream>
#include <cmath>

#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

class Parada {
public:
    int id;
    std::string nombre;
    double lat;
    double lng;
    int rutaId;
    int ordenEnRuta;

    Parada() : id(0), lat(0), lng(0), rutaId(0), ordenEnRuta(0) {}
    Parada(int id, const std::string& nombre, double lat, double lng,
           int rutaId, int ordenEnRuta)
        : id(id), nombre(nombre), lat(lat), lng(lng),
          rutaId(rutaId), ordenEnRuta(ordenEnRuta) {}

    double distanciaA(const Parada& otra) const {
        const double R = 6371000.0;
        double dLat = (otra.lat - lat) * M_PI / 180.0;
        double dLng = (otra.lng - lng) * M_PI / 180.0;
        double a = std::sin(dLat/2)*std::sin(dLat/2) +
                   std::cos(lat*M_PI/180.0) * std::cos(otra.lat*M_PI/180.0) *
                   std::sin(dLng/2)*std::sin(dLng/2);
        return R * 2.0 * std::atan2(std::sqrt(a), std::sqrt(1.0 - a));
    }

    std::string toString() const {
        std::ostringstream ss;
        ss << "Parada{id=" << id << ", nombre=" << nombre
           << ", lat=" << lat << ", lng=" << lng << "}";
        return ss.str();
    }
};
