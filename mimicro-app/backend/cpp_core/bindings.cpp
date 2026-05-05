#include <pybind11/pybind11.h>
#include <pybind11/stl.h>

#include "../../PROYECTO ESTRUCTURA/CLASES HECTOR/Analizador_Flujo_Hector.h"
#include "../../PROYECTO ESTRUCTURA/CLASES HECTOR/Reporte_Seguridad_Hector.h"
#include "../../PROYECTO ESTRUCTURA/CLASES BRUNO/persona.h"
#include "../../PROYECTO ESTRUCTURA/CLASES BRUNO/TarjetaTransporte.h"
#include "../../PROYECTO ESTRUCTURA/CLASES BRUNO/GestorPagos.h"
#include "../../PROYECTO ESTRUCTURA/CLASES CRISTHIAN/Ruta.h"
#include "../../PROYECTO ESTRUCTURA/CLASES CRISTHIAN/GrafoParadas.h"
#include "../../PROYECTO ESTRUCTURA/CLASES CRISTHIAN/OptimizadorRuta.h"
#include "../../PROYECTO ESTRUCTURA/CLASES JAVIER/Parada.h"
#include "../../PROYECTO ESTRUCTURA/CLASES JAVIER/PilaHistorial.h"
#include "../../PROYECTO ESTRUCTURA/CLASES JAVIER/GestorGPS.h"
#include "../../PROYECTO ESTRUCTURA/CLASES ROBERTO/Micro.h"
#include "../../PROYECTO ESTRUCTURA/CLASES ROBERTO/ListaPasajeros.h"
#include "../../PROYECTO ESTRUCTURA/CLASES ROBERTO/SensorPuerta.h"
#include "../../PROYECTO ESTRUCTURA/CLASES SAMUEL/ColaEspera.h"
#include "../../PROYECTO ESTRUCTURA/CLASES SAMUEL/NotificacionAlerta.h"
#include "../../PROYECTO ESTRUCTURA/CLASES SAMUEL/TiempoEstimado.h"

namespace py = pybind11;

PYBIND11_MODULE(mimicro_core, m) {
    m.doc() = "miMicro C++ core — estructuras de datos expuestas a Python via pybind11";

    // ── Structs ───────────────────────────────────────────────────────────────

    py::class_<DatoFlujo>(m, "DatoFlujo")
        .def(py::init<>())
        .def_readwrite("rutaId",           &DatoFlujo::rutaId)
        .def_readwrite("hora",             &DatoFlujo::hora)
        .def_readwrite("cantidadViajes",   &DatoFlujo::cantidadViajes)
        .def_readwrite("pasajerosTotales", &DatoFlujo::pasajerosTotales);

    py::class_<LogSeguridad>(m, "LogSeguridad")
        .def(py::init<>())
        .def_readwrite("id",        &LogSeguridad::id)
        .def_readwrite("evento",    &LogSeguridad::evento)
        .def_readwrite("usuario",   &LogSeguridad::usuario)
        .def_readwrite("ip",        &LogSeguridad::ip)
        .def_readwrite("timestamp", &LogSeguridad::timestamp)
        .def_readwrite("nivel",     &LogSeguridad::nivel);

    py::class_<Transaccion>(m, "Transaccion")
        .def(py::init<>())
        .def_readwrite("id",          &Transaccion::id)
        .def_readwrite("tarjetaId",   &Transaccion::tarjetaId)
        .def_readwrite("monto",       &Transaccion::monto)
        .def_readwrite("tipo",        &Transaccion::tipo)
        .def_readwrite("descripcion", &Transaccion::descripcion);

    py::class_<AristaGrafo>(m, "AristaGrafo")
        .def(py::init<>())
        .def_readwrite("paradaDestino", &AristaGrafo::paradaDestino)
        .def_readwrite("peso",          &AristaGrafo::peso);

    py::class_<ResultadoRuta>(m, "ResultadoRuta")
        .def(py::init<>())
        .def_readwrite("camino",          &ResultadoRuta::camino)
        .def_readwrite("distanciaTotal",  &ResultadoRuta::distanciaTotal)
        .def_readwrite("encontrado",      &ResultadoRuta::encontrado);

    py::class_<PosicionGPS>(m, "PosicionGPS")
        .def(py::init<>())
        .def_readwrite("microId",    &PosicionGPS::microId)
        .def_readwrite("lat",        &PosicionGPS::lat)
        .def_readwrite("lng",        &PosicionGPS::lng)
        .def_readwrite("timestamp",  &PosicionGPS::timestamp)
        .def_readwrite("velocidad",  &PosicionGPS::velocidad);

    py::class_<RegistroViaje>(m, "RegistroViaje")
        .def(py::init<>())
        .def_readwrite("usuarioId",        &RegistroViaje::usuarioId)
        .def_readwrite("microId",          &RegistroViaje::microId)
        .def_readwrite("paradaOrigenId",   &RegistroViaje::paradaOrigenId)
        .def_readwrite("paradaDestinoId",  &RegistroViaje::paradaDestinoId)
        .def_readwrite("fecha",            &RegistroViaje::fecha)
        .def_readwrite("costo",            &RegistroViaje::costo);

    py::class_<PasajeroEspera>(m, "PasajeroEspera")
        .def(py::init<>())
        .def_readwrite("usuarioId",  &PasajeroEspera::usuarioId)
        .def_readwrite("paradaId",   &PasajeroEspera::paradaId)
        .def_readwrite("timestamp",  &PasajeroEspera::timestamp)
        .def_readwrite("rutaId",     &PasajeroEspera::rutaId);

    py::class_<Notificacion>(m, "Notificacion")
        .def(py::init<>())
        .def_readwrite("id",             &Notificacion::id)
        .def_readwrite("usuarioId",      &Notificacion::usuarioId)
        .def_readwrite("mensaje",        &Notificacion::mensaje)
        .def_readwrite("tipo",           &Notificacion::tipo)
        .def_readwrite("leida",          &Notificacion::leida)
        .def_readwrite("fechaCreacion",  &Notificacion::fechaCreacion);

    py::class_<ResultadoETA>(m, "ResultadoETA")
        .def(py::init<>())
        .def_readwrite("microId",          &ResultadoETA::microId)
        .def_readwrite("paradaId",         &ResultadoETA::paradaId)
        .def_readwrite("distanciaMetros",  &ResultadoETA::distanciaMetros)
        .def_readwrite("tiempoSegundos",   &ResultadoETA::tiempoSegundos)
        .def_readwrite("ocupacion",        &ResultadoETA::ocupacion);

    // ── Clases ───────────────────────────────────────────────────────────────

    py::class_<AnalizadorFlujo>(m, "AnalizadorFlujo")
        .def(py::init<>())
        .def("registrarViaje",     &AnalizadorFlujo::registrarViaje)
        .def("obtenerFlujo",       &AnalizadorFlujo::obtenerFlujo)
        .def("obtenerFlujoRuta",   &AnalizadorFlujo::obtenerFlujoRuta)
        .def("obtenerFlujoHora",   &AnalizadorFlujo::obtenerFlujoHora)
        .def("getTotalViajes",     &AnalizadorFlujo::getTotalViajes)
        .def("setMicrosActivos",   &AnalizadorFlujo::setMicrosActivos)
        .def("getMicrosActivos",   &AnalizadorFlujo::getMicrosActivos);

    py::class_<ReporteSeguridad>(m, "ReporteSeguridad")
        .def(py::init<>())
        .def("registrarAcceso",       &ReporteSeguridad::registrarAcceso)
        .def("registrarError",        &ReporteSeguridad::registrarError)
        .def("registrarAdvertencia",  &ReporteSeguridad::registrarAdvertencia)
        .def("obtenerLogs",           &ReporteSeguridad::obtenerLogs, py::arg("limite") = 50)
        .def("obtenerLogsPorNivel",   &ReporteSeguridad::obtenerLogsPorNivel)
        .def("contarEventos",         &ReporteSeguridad::contarEventos);

    py::class_<Persona>(m, "Persona")
        .def(py::init<>())
        .def(py::init<int, const std::string&, const std::string&,
                      const std::string&, const std::string&, const std::string&>(),
             py::arg("id"), py::arg("nombre"), py::arg("email"),
             py::arg("passwordHash"), py::arg("rol"), py::arg("telefono") = "")
        .def_readwrite("id",           &Persona::id)
        .def_readwrite("nombre",       &Persona::nombre)
        .def_readwrite("email",        &Persona::email)
        .def_readwrite("rol",          &Persona::rol)
        .def_readwrite("telefono",     &Persona::telefono)
        .def("esAdmin",    &Persona::esAdmin)
        .def("esChofer",   &Persona::esChofer)
        .def("esPasajero", &Persona::esPasajero)
        .def("toString",   &Persona::toString);

    py::class_<TarjetaTransporte>(m, "TarjetaTransporte")
        .def(py::init<>())
        .def(py::init<int, int, double, const std::string&>())
        .def("getId",              &TarjetaTransporte::getId)
        .def("getSaldo",           &TarjetaTransporte::getSaldo)
        .def("recargar",           &TarjetaTransporte::recargar)
        .def("cobrar",             &TarjetaTransporte::cobrar)
        .def("estaActiva",         &TarjetaTransporte::estaActiva)
        .def("getNumeroTarjeta",   &TarjetaTransporte::getNumeroTarjeta)
        .def("getUsuarioId",       &TarjetaTransporte::getUsuarioId)
        .def("desactivar",         &TarjetaTransporte::desactivar)
        .def("activar",            &TarjetaTransporte::activar);

    py::class_<GestorPagos>(m, "GestorPagos")
        .def(py::init<>())
        .def("agregarTarjeta",    &GestorPagos::agregarTarjeta)
        .def("recargarTarjeta",   &GestorPagos::recargarTarjeta)
        .def("cobrarPasaje",      &GestorPagos::cobrarPasaje)
        .def("consultarSaldo",    &GestorPagos::consultarSaldo)
        .def("obtenerHistorial",  &GestorPagos::obtenerHistorial,
             py::arg("tarjetaId"), py::arg("limite") = 5);

    py::class_<Ruta>(m, "Ruta")
        .def(py::init<>())
        .def(py::init<int, const std::string&, const std::string&>(),
             py::arg("id"), py::arg("nombre"), py::arg("descripcion") = "")
        .def_readwrite("id",          &Ruta::id)
        .def_readwrite("nombre",      &Ruta::nombre)
        .def_readwrite("descripcion", &Ruta::descripcion)
        .def_readwrite("activa",      &Ruta::activa)
        .def_readwrite("paradaIds",   &Ruta::paradaIds)
        .def("agregarParada",   &Ruta::agregarParada)
        .def("tieneParada",     &Ruta::tieneParada)
        .def("getNumParadas",   &Ruta::getNumParadas)
        .def("desactivar",      &Ruta::desactivar);

    py::class_<GrafoParadas>(m, "GrafoParadas")
        .def(py::init<>())
        .def("agregarParada",         &GrafoParadas::agregarParada)
        .def("agregarArista",         &GrafoParadas::agregarArista)
        .def("obtenerVecinos",        &GrafoParadas::obtenerVecinos)
        .def("existeParada",          &GrafoParadas::existeParada)
        .def("getNumParadas",         &GrafoParadas::getNumParadas)
        .def("obtenerTodasParadas",   &GrafoParadas::obtenerTodasParadas);

    py::class_<OptimizadorRuta>(m, "OptimizadorRuta")
        .def(py::init<const GrafoParadas&>())
        .def("encontrarRutaOptima",  &OptimizadorRuta::encontrarRutaOptima)
        .def("calcularDistancia",    &OptimizadorRuta::calcularDistancia);

    py::class_<Parada>(m, "Parada")
        .def(py::init<>())
        .def(py::init<int, const std::string&, double, double, int, int>())
        .def_readwrite("id",           &Parada::id)
        .def_readwrite("nombre",       &Parada::nombre)
        .def_readwrite("lat",          &Parada::lat)
        .def_readwrite("lng",          &Parada::lng)
        .def_readwrite("rutaId",       &Parada::rutaId)
        .def_readwrite("ordenEnRuta",  &Parada::ordenEnRuta)
        .def("distanciaA",  &Parada::distanciaA)
        .def("toString",    &Parada::toString);

    py::class_<PilaHistorial>(m, "PilaHistorial")
        .def(py::init<int>(), py::arg("maxTamanio") = 100)
        .def("agregarViaje",   &PilaHistorial::agregarViaje)
        .def("obtenerUltimo",  &PilaHistorial::obtenerUltimo)
        .def("estaVacia",      &PilaHistorial::estaVacia)
        .def("getTamanio",     &PilaHistorial::getTamanio)
        .def("obtenerTodos",   &PilaHistorial::obtenerTodos)
        .def("limpiar",        &PilaHistorial::limpiar);

    py::class_<GestorGPS>(m, "GestorGPS")
        .def(py::init<>())
        .def("actualizarPosicion",  &GestorGPS::actualizarPosicion)
        .def("obtenerPosicion",     &GestorGPS::obtenerPosicion)
        .def("microActivo",         &GestorGPS::microActivo)
        .def("eliminarMicro",       &GestorGPS::eliminarMicro)
        .def("obtenerTodas",        &GestorGPS::obtenerTodas)
        .def("contarActivos",       &GestorGPS::contarActivos);

    py::class_<Micro>(m, "Micro")
        .def(py::init<>())
        .def(py::init<int, const std::string&, int, int, int>(),
             py::arg("id"), py::arg("placa"), py::arg("choferId"),
             py::arg("rutaId"), py::arg("capacidad") = 30)
        .def_readwrite("id",              &Micro::id)
        .def_readwrite("placa",           &Micro::placa)
        .def_readwrite("choferId",        &Micro::choferId)
        .def_readwrite("rutaId",          &Micro::rutaId)
        .def_readwrite("capacidad",       &Micro::capacidad)
        .def_readwrite("estado",          &Micro::estado)
        .def_readwrite("pasajerosAbordo", &Micro::pasajerosAbordo)
        .def("estaActivo",     &Micro::estaActivo)
        .def("estaLleno",      &Micro::estaLleno)
        .def("getOcupacion",   &Micro::getOcupacion)
        .def("activar",        &Micro::activar)
        .def("desactivar",     &Micro::desactivar)
        .def("subirPasajero",  &Micro::subirPasajero)
        .def("bajarPasajero",  &Micro::bajarPasajero);

    py::class_<SensorPuerta>(m, "SensorPuerta")
        .def(py::init<int>())
        .def("abrirPuerta",        &SensorPuerta::abrirPuerta)
        .def("cerrarPuerta",       &SensorPuerta::cerrarPuerta)
        .def("registrarEntrada",   &SensorPuerta::registrarEntrada)
        .def("registrarSalida",    &SensorPuerta::registrarSalida)
        .def("getEntradas",        &SensorPuerta::getEntradas)
        .def("getSalidas",         &SensorPuerta::getSalidas)
        .def("getPasajerosNetos",  &SensorPuerta::getPasajerosNetos)
        .def("isPuertaAbierta",    &SensorPuerta::isPuertaAbierta)
        .def("getMicroId",         &SensorPuerta::getMicroId)
        .def("resetear",           &SensorPuerta::resetear);

    py::class_<ColaEspera>(m, "ColaEspera")
        .def(py::init<int>())
        .def("agregarPasajero",  &ColaEspera::agregarPasajero)
        .def("atenderPasajero",  &ColaEspera::atenderPasajero)
        .def("estaVacia",        &ColaEspera::estaVacia)
        .def("getTamanio",       &ColaEspera::getTamanio)
        .def("getParadaId",      &ColaEspera::getParadaId);

    py::class_<NotificacionAlerta>(m, "NotificacionAlerta")
        .def(py::init<>())
        .def("crearNotificacion",    &NotificacionAlerta::crearNotificacion)
        .def("obtenerParaUsuario",   &NotificacionAlerta::obtenerParaUsuario)
        .def("marcarLeida",          &NotificacionAlerta::marcarLeida)
        .def("contarNoLeidas",       &NotificacionAlerta::contarNoLeidas);

    py::class_<TiempoEstimado>(m, "TiempoEstimado")
        .def(py::init<>())
        .def("calcularETA",          &TiempoEstimado::calcularETA)
        .def("distanciaASegundos",   &TiempoEstimado::distanciaASegundos);
}
