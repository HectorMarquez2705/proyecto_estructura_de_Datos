-- miMicro — Esquema PostgreSQL completo
-- Ejecutar: psql -U postgres -d mimicro_db -f schema.sql

CREATE TABLE IF NOT EXISTS usuarios (
    id            SERIAL PRIMARY KEY,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol           VARCHAR(20)  NOT NULL CHECK (rol IN ('pasajero','chofer','admin','suspendido')),
    nombre        VARCHAR(255) NOT NULL,
    telefono      VARCHAR(20)  DEFAULT '',
    foto_url      VARCHAR(500) DEFAULT NULL,
    created_at    TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tarjetas_transporte (
    id             SERIAL PRIMARY KEY,
    usuario_id     INTEGER      REFERENCES usuarios(id) ON DELETE CASCADE,
    saldo          DECIMAL(10,2) DEFAULT 0.00,
    numero_tarjeta VARCHAR(20)  UNIQUE NOT NULL,
    activa         BOOLEAN      DEFAULT TRUE,
    created_at     TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transacciones (
    id          SERIAL PRIMARY KEY,
    tarjeta_id  INTEGER      REFERENCES tarjetas_transporte(id) ON DELETE CASCADE,
    monto       DECIMAL(10,2) NOT NULL,
    tipo        VARCHAR(20)  CHECK (tipo IN ('recarga','cobro')),
    descripcion VARCHAR(255) DEFAULT '',
    created_at  TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rutas (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    descripcion TEXT         DEFAULT '',
    activa      BOOLEAN      DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS paradas (
    id            SERIAL PRIMARY KEY,
    nombre        VARCHAR(255) NOT NULL,
    lat           DECIMAL(10,8) NOT NULL,
    lng           DECIMAL(11,8) NOT NULL,
    ruta_id       INTEGER      REFERENCES rutas(id) ON DELETE CASCADE,
    orden_en_ruta INTEGER      NOT NULL
);

CREATE TABLE IF NOT EXISTS lineas (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(50)  NOT NULL UNIQUE,
    descripcion TEXT         DEFAULT '',
    ruta_path   JSONB        DEFAULT '[]',
    created_at  TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS paradas_linea (
    id        SERIAL PRIMARY KEY,
    linea_id  INTEGER      NOT NULL REFERENCES lineas(id) ON DELETE CASCADE,
    nombre    VARCHAR(255) NOT NULL,
    lat       DECIMAL(10,8) NOT NULL,
    lng       DECIMAL(11,8) NOT NULL,
    orden     INTEGER      NOT NULL DEFAULT 0,
    created_at TIMESTAMP   DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS micros (
    id               SERIAL PRIMARY KEY,
    placa            VARCHAR(20)  UNIQUE NOT NULL,
    modelo           VARCHAR(100) DEFAULT '',
    descripcion      TEXT         DEFAULT '',
    chofer_id        INTEGER      REFERENCES usuarios(id),
    ruta_id          INTEGER      REFERENCES rutas(id),
    linea_id         INTEGER      REFERENCES lineas(id) ON DELETE SET NULL,
    capacidad        INTEGER      DEFAULT 30,
    estado           VARCHAR(20)  DEFAULT 'inactivo' CHECK (estado IN ('activo','inactivo')),
    ocupacion_estado VARCHAR(20)  DEFAULT 'vacio'    CHECK (ocupacion_estado IN ('vacio','medio','lleno'))
);

CREATE TABLE IF NOT EXISTS historial_viajes (
    id                 SERIAL PRIMARY KEY,
    usuario_id         INTEGER      REFERENCES usuarios(id),
    micro_id           INTEGER      REFERENCES micros(id),
    parada_origen_id   INTEGER      REFERENCES paradas(id),
    parada_destino_id  INTEGER      REFERENCES paradas(id),
    fecha              TIMESTAMP    DEFAULT NOW(),
    costo              DECIMAL(10,2) DEFAULT 3.50
);

CREATE TABLE IF NOT EXISTS notificaciones (
    id          SERIAL PRIMARY KEY,
    usuario_id  INTEGER      REFERENCES usuarios(id) ON DELETE CASCADE,
    mensaje     TEXT         NOT NULL,
    tipo        VARCHAR(50)  DEFAULT 'info',
    leida       BOOLEAN      DEFAULT FALSE,
    created_at  TIMESTAMP    DEFAULT NOW()
);

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_micros_ruta       ON micros(ruta_id);
CREATE INDEX IF NOT EXISTS idx_micros_linea      ON micros(linea_id);
CREATE INDEX IF NOT EXISTS idx_paradas_linea     ON paradas_linea(linea_id, orden);
CREATE INDEX IF NOT EXISTS idx_paradas_ruta      ON paradas(ruta_id, orden_en_ruta);
CREATE INDEX IF NOT EXISTS idx_historial_usuario ON historial_viajes(usuario_id, fecha DESC);
CREATE INDEX IF NOT EXISTS idx_notif_usuario     ON notificaciones(usuario_id, leida);
CREATE INDEX IF NOT EXISTS idx_transacc_tarjeta  ON transacciones(tarjeta_id, created_at DESC);
