-- Migración: agregar tabla lineas y nuevas columnas a micros
-- Ejecutar: psql -U postgres -d mimicro_db -f migration_lineas.sql

CREATE TABLE IF NOT EXISTS lineas (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(50)  NOT NULL UNIQUE,
    descripcion TEXT         DEFAULT '',
    ruta_path   JSONB        DEFAULT '[]',
    created_at  TIMESTAMP    DEFAULT NOW()
);

ALTER TABLE micros ADD COLUMN IF NOT EXISTS modelo      VARCHAR(100) DEFAULT '';
ALTER TABLE micros ADD COLUMN IF NOT EXISTS descripcion TEXT         DEFAULT '';
ALTER TABLE micros ADD COLUMN IF NOT EXISTS linea_id    INTEGER REFERENCES lineas(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_micros_linea ON micros(linea_id);

-- Tabla de paradas por línea (para routing Dijkstra)
CREATE TABLE IF NOT EXISTS paradas_linea (
    id        SERIAL PRIMARY KEY,
    linea_id  INTEGER      NOT NULL REFERENCES lineas(id) ON DELETE CASCADE,
    nombre    VARCHAR(255) NOT NULL,
    lat       DECIMAL(10,8) NOT NULL,
    lng       DECIMAL(11,8) NOT NULL,
    orden     INTEGER      NOT NULL DEFAULT 0,
    created_at TIMESTAMP   DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_paradas_linea ON paradas_linea(linea_id, orden);
