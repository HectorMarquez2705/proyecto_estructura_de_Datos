#pragma once
#include <string>
#include <vector>
#include <algorithm>

struct Notificacion {
    int id;
    int usuarioId;
    std::string mensaje;
    std::string tipo;
    bool leida;
    std::string fechaCreacion;
};

class NotificacionAlerta {
private:
    std::vector<Notificacion> notificaciones;
    int nextId;

public:
    NotificacionAlerta() : nextId(1) {}

    int crearNotificacion(int usuarioId, const std::string& mensaje,
                          const std::string& tipo) {
        Notificacion n;
        n.id = nextId++;
        n.usuarioId = usuarioId;
        n.mensaje = mensaje;
        n.tipo = tipo;
        n.leida = false;
        notificaciones.push_back(n);
        return n.id;
    }

    std::vector<Notificacion> obtenerParaUsuario(int usuarioId) const {
        std::vector<Notificacion> res;
        for (auto& n : notificaciones)
            if (n.usuarioId == usuarioId) res.push_back(n);
        return res;
    }

    bool marcarLeida(int notificacionId) {
        for (auto& n : notificaciones)
            if (n.id == notificacionId) { n.leida = true; return true; }
        return false;
    }

    int contarNoLeidas(int usuarioId) const {
        return (int)std::count_if(notificaciones.begin(), notificaciones.end(),
            [&](const Notificacion& n){ return n.usuarioId == usuarioId && !n.leida; });
    }
};
