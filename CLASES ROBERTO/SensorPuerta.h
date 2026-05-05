#pragma once

class SensorPuerta {
private:
    int microId;
    int contadorEntradas;
    int contadorSalidas;
    bool puertaAbierta;

public:
    SensorPuerta(int microId)
        : microId(microId), contadorEntradas(0),
          contadorSalidas(0), puertaAbierta(false) {}

    void abrirPuerta()  { puertaAbierta = true;  }
    void cerrarPuerta() { puertaAbierta = false; }

    bool registrarEntrada() {
        if (!puertaAbierta) return false;
        contadorEntradas++; return true;
    }

    bool registrarSalida() {
        if (!puertaAbierta) return false;
        contadorSalidas++; return true;
    }

    int getEntradas() const       { return contadorEntradas; }
    int getSalidas() const        { return contadorSalidas; }
    int getPasajerosNetos() const { return contadorEntradas - contadorSalidas; }
    bool isPuertaAbierta() const  { return puertaAbierta; }
    int getMicroId() const        { return microId; }

    void resetear() {
        contadorEntradas = 0;
        contadorSalidas  = 0;
        puertaAbierta    = false;
    }
};
