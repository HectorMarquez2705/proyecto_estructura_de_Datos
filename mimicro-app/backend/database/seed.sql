-- miMicro — Datos iniciales para desarrollo/testing
-- IMPORTANTE: Cambiar la contrasena del admin antes de produccion.
-- Para generar un hash bcrypt nuevo:
--   python -c "from passlib.context import CryptContext; print(CryptContext(['bcrypt']).hash('TuNuevaContrasena'))"

-- Admin (contrasena: Admin2026!)
-- Hash generado con: python -c "import bcrypt; print(bcrypt.hashpw(b'Admin2026!', bcrypt.gensalt(12)).decode())"
INSERT INTO usuarios (email, password_hash, rol, nombre, telefono)
VALUES (
    'admin@mimicro.bo',
    '$2b$12$ouIgUYE7fy1RXmjN2O7x8.QZ7p4IXCvLo7erk6HSF67a96aZ124jW',
    'admin',
    'Administrador miMicro',
    '+591 70000000'
) ON CONFLICT (email) DO NOTHING;

-- Choferes de prueba (contrasena: Chofer123!)
INSERT INTO usuarios (email, password_hash, rol, nombre, telefono) VALUES
('pedro.rios@mimicro.bo',   '$2b$12$wKZoHSnZ808SlEVApkeDFeIl1WChvq/6u5SOdYgijofLsrCLcGdUK', 'chofer', 'Pedro Rios',   '+591 71111111'),
('carlos.vaca@mimicro.bo',  '$2b$12$wKZoHSnZ808SlEVApkeDFeIl1WChvq/6u5SOdYgijofLsrCLcGdUK', 'chofer', 'Carlos Vaca',  '+591 72222222')
ON CONFLICT (email) DO NOTHING;

-- Pasajeros de prueba (contrasena: Pasajero123!)
INSERT INTO usuarios (email, password_hash, rol, nombre, telefono) VALUES
('juan.perez@mail.com',  '$2b$12$qpaxt0jGZA36z/1o9i7A.es3hw35pbBMQ2etSXhOkucYHA7dA0522', 'pasajero', 'Juan Perez',  '+591 76543210'),
('maria.lopez@mail.com', '$2b$12$qpaxt0jGZA36z/1o9i7A.es3hw35pbBMQ2etSXhOkucYHA7dA0522', 'pasajero', 'Maria Lopez', '+591 76543211')
ON CONFLICT (email) DO NOTHING;

-- Tarjetas para los pasajeros
INSERT INTO tarjetas_transporte (usuario_id, saldo, numero_tarjeta)
SELECT id, 50.00, 'TC-' || LPAD(id::TEXT, 6, '0')
FROM usuarios WHERE rol='pasajero'
ON CONFLICT DO NOTHING;

-- Rutas de SCZ
INSERT INTO rutas (nombre, descripcion) VALUES
('Ruta 17 - Terminal / Urbarí',      'Terminal Bimodal → 2do Anillo → Equipetrol → Urbarí'),
('Ruta 24 - Mercado Los Pozos / UV',  'Mercado Los Pozos → Av. Cañoto → UV'),
('Ruta 31 - Plan 3000 / Centro',      'Plan 3000 → Av. Brasil → Plaza 24 de Septiembre')
ON CONFLICT DO NOTHING;

-- Paradas Ruta 17
INSERT INTO paradas (nombre, lat, lng, ruta_id, orden_en_ruta) VALUES
('Terminal Bimodal',          -17.78330, -63.18200, 1, 1),
('Av. Cañoto / 2do Anillo',   -17.78500, -63.18000, 1, 2),
('Equipetrol Norte',          -17.77500, -63.19500, 1, 3),
('Plaza del Estudiante',      -17.77200, -63.19800, 1, 4),
('Urbarí',                    -17.76800, -63.20500, 1, 5)
ON CONFLICT DO NOTHING;

-- Paradas Ruta 24
INSERT INTO paradas (nombre, lat, lng, ruta_id, orden_en_ruta) VALUES
('Mercado Los Pozos',         -17.79100, -63.17200, 2, 1),
('Av. Cañoto Esq. 21 Sept',   -17.78600, -63.17900, 2, 2),
('Plaza 24 de Septiembre',    -17.78330, -63.18220, 2, 3),
('Universidad UV',            -17.77900, -63.18600, 2, 4)
ON CONFLICT DO NOTHING;

-- Micros
INSERT INTO micros (placa, chofer_id, ruta_id, capacidad, estado)
SELECT 'SCZ-1234', u.id, 1, 30, 'inactivo'
FROM usuarios u WHERE u.email='pedro.rios@mimicro.bo'
ON CONFLICT (placa) DO NOTHING;

INSERT INTO micros (placa, chofer_id, ruta_id, capacidad, estado)
SELECT 'SCZ-5678', u.id, 2, 25, 'inactivo'
FROM usuarios u WHERE u.email='carlos.vaca@mimicro.bo'
ON CONFLICT (placa) DO NOTHING;
