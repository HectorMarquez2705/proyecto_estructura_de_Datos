#pragma once
#include <string>
#include <vector>
#include <algorithm>

struct LogSeguridad {
    int id;
    std::string evento;
    std::string usuario;
    std::string ip;
    std::string timestamp;
    std::string nivel;
};

class ReporteSeguridad {
private:
    std::vector<LogSeguridad> logs;
    int nextId;

public:
    ReporteSeguridad() : nextId(1) {}

    void registrarAcceso(const std::string& usuario, const std::string& ip, bool exitoso) {
        logs.push_back({nextId++,
                        exitoso ? "LOGIN_OK" : "LOGIN_FAIL",
                        usuario, ip, "",
                        exitoso ? "INFO" : "WARNING"});
    }

    void registrarError(const std::string& evento, const std::string& detalle) {
        logs.push_back({nextId++, evento + ": " + detalle, "sistema", "", "", "ERROR"});
    }

    void registrarAdvertencia(const std::string& evento, const std::string& detalle) {
        logs.push_back({nextId++, evento + ": " + detalle, "sistema", "", "", "WARNING"});
    }

    std::vector<LogSeguridad> obtenerLogs(int limite = 50) const {
        int desde = (int)logs.size() - limite;
        if (desde < 0) desde = 0;
        return std::vector<LogSeguridad>(logs.begin() + desde, logs.end());
    }

    std::vector<LogSeguridad> obtenerLogsPorNivel(const std::string& nivel) const {
        std::vector<LogSeguridad> res;
        for (auto& l : logs)
            if (l.nivel == nivel) res.push_back(l);
        return res;
    }

    int contarEventos(const std::string& nivel) const {
        return (int)std::count_if(logs.begin(), logs.end(),
            [&](const LogSeguridad& l){ return l.nivel == nivel; });
    }
};
