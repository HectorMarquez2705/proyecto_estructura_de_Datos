#pragma once
#include <string>
#include <sstream>

class TarjetaTransporte {
private:
    int id;
    int usuarioId;
    double saldo;
    std::string numeroTarjeta;
    bool activa;

public:
    TarjetaTransporte() : id(0), usuarioId(0), saldo(0.0), activa(true) {}
    TarjetaTransporte(int id, int usuarioId, double saldo, const std::string& numeroTarjeta)
        : id(id), usuarioId(usuarioId), saldo(saldo),
          numeroTarjeta(numeroTarjeta), activa(true) {}

    int getId() const { return id; }
    double getSaldo() const { return saldo; }
    bool estaActiva() const { return activa; }
    std::string getNumeroTarjeta() const { return numeroTarjeta; }
    int getUsuarioId() const { return usuarioId; }

    bool recargar(double monto) {
        if (monto <= 0 || !activa) return false;
        saldo += monto;
        return true;
    }

    bool cobrar(double monto) {
        if (monto <= 0 || !activa || saldo < monto) return false;
        saldo -= monto;
        return true;
    }

    void desactivar() { activa = false; }
    void activar()    { activa = true; }

    std::string toString() const {
        std::ostringstream ss;
        ss << "Tarjeta{" << numeroTarjeta << ", saldo=" << saldo << " Bs}";
        return ss.str();
    }
};
