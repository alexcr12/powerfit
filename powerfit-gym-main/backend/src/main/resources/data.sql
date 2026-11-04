SET FOREIGN_KEY_CHECKS = 0;


CREATE TABLE IF NOT EXISTS categoria_beneficios_base (
    categoria_id BIGINT NOT NULL,
    producto_id BIGINT NOT NULL,
    PRIMARY KEY (categoria_id, producto_id)
);


INSERT IGNORE INTO usuarios (id, nombre, email, password, rol) VALUES 
(1, 'Carlos Mendoza', 'admin@powerfit.com', '$2a$12$JtqCkbRN7XyBAhRGeX8hReBacQjzP.QU5jdNx9ZR16.V97zXWTO1K', 'admin'),
(2, 'Lucía Torres', 'staff@powerfit.com', '$2a$12$JtqCkbRN7XyBAhRGeX8hReBacQjzP.QU5jdNx9ZR16.V97zXWTO1K', 'staff');


INSERT IGNORE INTO categorias (id, nombre, activo) VALUES 
(1, 'Fit', true), 
(2, 'Black', true), 
(3, 'Gold', true);


INSERT IGNORE INTO productos (id, categoria_id, nombre, precio_base, sede, activo) VALUES 
(1, 1, 'Acceso Sala Musculación', 50.00, 'Sede Central', 1),
(2, 1, 'Cardio & Funcional', 40.00, 'Sede Central', 1),
(3, 2, 'Clases de Spinning', 45.00, 'Sede Central', 1),
(4, 2, 'Yoga & Pilates', 55.00, 'Sede Miraflores', 1),
(5, 3, 'Sauna y Baño Turco', 30.00, 'Sede Central', 1),
(6, 3, 'Piscina & Jacuzzi', 60.00, 'Sede Miraflores', 1);

INSERT IGNORE INTO categoria_beneficios_base (categoria_id, producto_id) VALUES 
(1, 1), (1, 2),
(2, 3), (2, 4),
(3, 1), (3, 3), (3, 5), (3, 6);

INSERT IGNORE INTO socios (id, registrado_por, nombre, documento, telefono, fecha_registro, activo) VALUES 
(1, 'Carlos Mendoza', 'Juan Pérez Gómez', '72345678', '987654321', '2026-01-15', 1),
(2, 'Lucía Torres', 'María Fernanda López', '45678912', '912345678', '2026-02-10', 1),
(3, 'Lucía Torres', 'Roberto Gómez Bolaños', '10293847', '955443322', '2026-03-01', 1),
(4, 'Carlos Mendoza', 'Camila Valenzuela', '78945612', '998877665', '2026-04-05', 1),
(5, 'Lucía Torres', 'Diego Armando Rojas', '33445566', '944556677', '2026-05-12', 1);


INSERT IGNORE INTO membresias (id, socio_id, fecha_inicio, fecha_fin, monto_total, estado, es_primera) VALUES 
(1, 1, '2026-09-15', '2026-10-15', 90.00, 'activa', 1),
(2, 2, '2026-09-20', '2026-10-20', 100.00, 'activa', 0);

INSERT IGNORE INTO membresia_producto (id, membresia_id, producto_id, precio_unitario, cantidad_disponible) VALUES 
(1, 1, 1, 50.00, 1), 
(2, 1, 2, 40.00, 1),
(3, 2, 3, 45.00, 1),
(4, 2, 4, 55.00, 1);

INSERT IGNORE INTO pases_invitado (id, socio_id, nombre_inv, fecha_uso, activo) VALUES 
(1, 1, 'Lucas Silva', '2026-09-18', 1),
(2, 2, 'Valeria Ríos', '2026-09-22', 1);


INSERT IGNORE INTO asistencias (id, socio_id, fecha_hora, sede) VALUES 
(1, 1, '2026-10-04 08:30:00', 'Sede Central'),
(2, 1, '2026-10-05 09:15:00', 'Sede Central'),
(3, 2, '2026-10-05 18:00:00', 'Sede Central');

SET FOREIGN_KEY_CHECKS = 1;