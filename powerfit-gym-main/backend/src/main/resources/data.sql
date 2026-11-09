SET FOREIGN_KEY_CHECKS = 0;

INSERT IGNORE INTO usuarios (id, nombre, email, password, rol, activo) VALUES 
(1, 'Carlos Mendoza', 'admin@powerfit.com', '$2a$12$JtqCkbRN7XyBAhRGeX8hReBacQjzP.QU5jdNx9ZR16.V97zXWTO1K', 'admin', 1),
(2, 'Lucía Torres', 'staff@powerfit.com', '$2a$10$WAeuSAvqUFel.c3xO9bJZuEBwEZrIB1pF.gQYRcsQMxT2tCkB5udC', 'staff', 1);

INSERT IGNORE INTO categorias (id, nombre, activo) VALUES 
(1, 'Fit', true), 
(2, 'Black', true), 
(3, 'Gold', true);

INSERT IGNORE INTO productos (id, categoria_id, nombre, requiere_asistencia, activo) VALUES 
(1, 1, 'Lockers', 0, 1), (2, 1, 'Duchas', 0, 1),
(3, 2, 'Sauna', 0, 1), (4, 2, 'Danza', 1, 1),
(5, 3, 'Piscina', 0, 1), (6, 3, 'Spinning', 1, 1);

INSERT IGNORE INTO socios (id, registrado_por, nombre, documento, telefono, fecha_registro, activo) VALUES 
(1, 1, 'Juan Pérez Gómez', '72345678', '987654321', '2026-01-15', 1),
(2, 2, 'María Fernanda López', '45678912', '912345678', '2026-02-10', 1),
(3, 2, 'Roberto Gómez Bolaños', '10293847', '955443322', '2026-03-01', 1),
(4, 1, 'Camila Valenzuela', '78945612', '998877665', '2026-04-05', 1),
(5, 2, 'Diego Armando Rojas', '33445566', '944556677', '2026-05-12', 1);

INSERT IGNORE INTO membresias (id, socio_id, categoria_id, fecha_inicio, fecha_fin, monto_total, activo) VALUES 
(1, 1, 1, '2026-11-01', '2026-12-01', 100.00, 1),
(2, 2, 2, '2026-11-03', '2026-12-03', 200.00, 1),
(3, 3, 3, '2026-11-05', '2026-12-05', 300.00, 1);

INSERT IGNORE INTO pases_invitado (id, socio_id, nombre_inv, fecha_uso, activo) VALUES 
(1, 1, 'Lucas Silva', '2026-09-18', 1),
(2, 2, 'Valeria Ríos', '2026-09-22', 1);

INSERT IGNORE INTO asistencias (id, socio_id, producto_id, fecha_hora) VALUES 
(1, 2, 4, '2026-11-06 08:30:00'),
(2, 2, 4, '2026-11-07 09:15:00'),
(3, 3, 6, '2026-11-07 18:00:00');

SET FOREIGN_KEY_CHECKS = 1;
