#include <iostream>
#include <string>
#include "Analizador_Flujo_Hector.h"
#include "Reporte_Seguridad_Hector.h"
#include "../CLASES BRUNO/persona.h"
#include "../CLASES BRUNO/TarjetaTransporte.h"
#include "../CLASES BRUNO/GestorPagos.h"
#include "../CLASES CRISTHIAN/Ruta.h"
#include "../CLASES CRISTHIAN/GrafoParadas.h"
#include "../CLASES CRISTHIAN/OptimizadorRuta.h"
#include "../CLASES JAVIER/Parada.h"
#include "../CLASES JAVIER/PilaHistorial.h"
#include "../CLASES JAVIER/GestorGPS.h"
#include "../CLASES ROBERTO/Micro.h"
#include "../CLASES ROBERTO/ListaPasajeros.h"
#include "../CLASES ROBERTO/SensorPuerta.h"
#include "../CLASES SAMUEL/ColaEspera.h"
#include "../CLASES SAMUEL/NotificacionAlerta.h"
#include "../CLASES SAMUEL/TiempoEstimado.h"

int main() {
    std::cout << "=== miMicro - Demo del sistema ===" << std::endl;

    // --- Bruno: usuarios y pagos ---
    Persona pasajero(1, "Juan Perez", "juan@mail.com", "hash123", "pasajero");
    Persona chofer(2,  "Pedro Rios",  "pedro@mail.com","hash456", "chofer");
    std::cout << "[Persona] " << pasajero.toString() << std::endl;

    TarjetaTransporte tarjeta(1, 1, 50.0, "TC-0001");
    GestorPagos gestor;
    gestor.agregarTarjeta(&tarjeta);
    gestor.cobrarPasaje(1, 3.5);
    std::cout << "[Saldo]   " << gestor.consultarSaldo(1) << " Bs" << std::endl;

    // --- Cristhian: rutas y grafo ---
    Ruta ruta1(1, "Ruta 17 - Terminal / Urbarí");
    ruta1.agregarParada(1);
    ruta1.agregarParada(2);
    ruta1.agregarParada(3);

    Parada pTerminal(1, "Terminal Bimodal",        -17.7833, -63.1820, 1, 1);
    Parada pCentro  (2, "Plaza 24 de Septiembre",  -17.7833, -63.1822, 1, 2);
    Parada pUrbari  (3, "Urbari",                  -17.7900, -63.1900, 1, 3);

    GrafoParadas grafo;
    grafo.agregarArista(1, 2, pTerminal.distanciaA(pCentro));
    grafo.agregarArista(2, 3, pCentro.distanciaA(pUrbari));

    OptimizadorRuta optimizador(grafo);
    auto resultado = optimizador.encontrarRutaOptima(1, 3);
    std::cout << "[Ruta]    encontrada=" << resultado.encontrado
              << "  distancia=" << resultado.distanciaTotal << " m" << std::endl;

    // --- Javier: GPS e historial ---
    GestorGPS gps;
    gps.actualizarPosicion({2, -17.7833, -63.1820, 1746400000LL, 28.0});
    std::cout << "[GPS]     micro 2 activo=" << gps.microActivo(2) << std::endl;

    PilaHistorial historial;
    historial.agregarViaje({1, 2, 1, 3, "2026-05-05", 3.5});
    std::cout << "[Historial] viajes=" << historial.getTamanio() << std::endl;

    // --- Roberto: micros y sensor ---
    Micro micro(2, "SCZ-1234", 2, 1, 30);
    micro.activar();
    SensorPuerta sensor(2);
    sensor.abrirPuerta();
    sensor.registrarEntrada(); sensor.registrarEntrada(); sensor.registrarEntrada();
    std::cout << "[Micro]   " << micro.toString() << std::endl;
    std::cout << "[Sensor]  entradas=" << sensor.getEntradas() << std::endl;

    // --- Samuel: cola, ETA y notificaciones ---
    ColaEspera cola(1);
    cola.agregarPasajero({1, 1, "2026-05-05T08:00", 1});
    cola.agregarPasajero({3, 1, "2026-05-05T08:01", 1});
    std::cout << "[Cola]    esperando=" << cola.getTamanio() << std::endl;

    TiempoEstimado eta;
    PosicionGPS pos{2, -17.7833, -63.1820, 1746400000LL, 28.0};
    auto r = eta.calcularETA(pos, pUrbari, "medio");
    std::cout << "[ETA]     " << r.tiempoSegundos << " segundos ("
              << r.distanciaMetros << " m)" << std::endl;

    NotificacionAlerta alertas;
    alertas.crearNotificacion(1, "El micro 17 se demora 5 min", "retraso");
    std::cout << "[Notif]   no leidas=" << alertas.contarNoLeidas(1) << std::endl;

    // --- Hector: flujo y seguridad ---
    AnalizadorFlujo flujo;
    flujo.registrarViaje(1, 8, 15);
    flujo.registrarViaje(1, 8, 12);
    flujo.setMicrosActivos(gps.contarActivos());
    std::cout << "[Flujo]   total viajes=" << flujo.getTotalViajes()
              << "  micros activos=" << flujo.getMicrosActivos() << std::endl;

    ReporteSeguridad seguridad;
    seguridad.registrarAcceso("juan@mail.com", "192.168.1.10", true);
    seguridad.registrarAcceso("hack@mail.com", "10.0.0.1",     false);
    std::cout << "[Seg]     INFO=" << seguridad.contarEventos("INFO")
              << "  WARNING=" << seguridad.contarEventos("WARNING") << std::endl;

    return 0;
}
