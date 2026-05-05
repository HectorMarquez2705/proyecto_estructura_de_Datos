#pragma once
#include <cmath>
#include <string>
#include "../CLASES JAVIER/GestorGPS.h"
#include "../CLASES JAVIER/Parada.h"

#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

struct ResultadoETA {
    int microId;
    int paradaId;
    double distanciaMetros;
    int tiempoSegundos;
    std::string ocupacion;
};

class TiempoEstimado {
private:
    static constexpr double VELOCIDAD_PROMEDIO_KMH = 25.0;

    double haversine(double lat1, double lng1, double lat2, double lng2) const {
        const double R = 6371000.0;
        double dLat = (lat2 - lat1) * M_PI / 180.0;
        double dLng = (lng2 - lng1) * M_PI / 180.0;
        double a = std::sin(dLat/2)*std::sin(dLat/2) +
                   std::cos(lat1*M_PI/180.0) * std::cos(lat2*M_PI/180.0) *
                   std::sin(dLng/2)*std::sin(dLng/2);
        return R * 2.0 * std::atan2(std::sqrt(a), std::sqrt(1.0 - a));
    }

public:
    TiempoEstimado() {}

    ResultadoETA calcularETA(const PosicionGPS& posicion,
                              const Parada& paradaDestino,
                              const std::string& ocupacion) {
        double dist = haversine(posicion.lat, posicion.lng,
                                 paradaDestino.lat, paradaDestino.lng);
        double vel = posicion.velocidad > 1.0 ? posicion.velocidad : VELOCIDAD_PROMEDIO_KMH;
        int seg = (int)((dist / 1000.0) / vel * 3600.0);
        return {posicion.microId, paradaDestino.id, dist, seg, ocupacion};
    }

    int distanciaASegundos(double distanciaMetros) const {
        return (int)((distanciaMetros / 1000.0) / VELOCIDAD_PROMEDIO_KMH * 3600.0);
    }
};
