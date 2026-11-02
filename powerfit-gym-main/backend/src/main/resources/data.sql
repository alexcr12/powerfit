
INSERT IGNORE INTO usuarios (id, nombre, email, password, rol) VALUES 
(1, 'Carlos Mendoza', 'admin@powerfit.com', '$2a$12$JtqCkbRN7XyBAhRGeX8hReBacQjzP.QU5jdNx9ZR16.V97zXWTO1K', 'admin'),
(2, 'Lucía Torres', 'staff@powerfit.com', '$2a$12$JtqCkbRN7XyBAhRGeX8hReBacQjzP.QU5jdNx9ZR16.V97zXWTO1K', 'staff');


INSERT IGNORE INTO categorias (id, nombre, activo) VALUES 
(1, 'Acceso y Musculación', 1),
(2, 'Clases Dirigidas', 1),
(3, 'Zona Húmeda y Relax', 1),
(4, 'Servicios Complementarios', 1);


INSERT IGNORE INTO productos (id, categoria_id, nombre, precio_base, sede, activo) VALUES 
(1, 1, 'Acceso Sala Musculación & Cardio', 120.00, 'Sede Central', 1),
(2, 1, 'Pase Entrenamiento Funcional & Cross', 95.00, 'Sede Central', 1),
(3, 2, 'Membresía Clases Indoor Spinning', 80.00, 'Sede Central', 1),
(4, 2, 'Clases de Yoga & Pilates Reformer', 75.00, 'Sede Miraflores', 1),
(5, 2, 'Taller de Boxeo y Artes Marciales', 90.00, 'Sede Central', 1),
(6, 3, 'Acceso Sauna Seco y Baño Turco', 65.00, 'Sede Central', 1),
(7, 3, 'Piscina Libre & Jacuzzi', 110.00, 'Sede Miraflores', 1),
(8, 4, 'Casillero VIP Privado Mensual', 35.00, 'Sede Central', 1),
(9, 4, 'Evaluación Nutricional & Bioimpedancia', 70.00, 'Sede Central', 1),
(10, 4, 'Servicio de Toallas y Bebidas Fit', 45.00, 'Sede Miraflores', 1);


INSERT IGNORE INTO socios (id, registrado_por, nombre, documento, telefono, fecha_registro, activo) VALUES 
(1, 'Carlos Mendoza', 'Juan Pérez Gómez', '72345678', '987654321', '2026-01-15', 1),
(2, 'Lucía Torres', 'María Fernanda López', '45678912', '912345678', '2026-02-10', 1),
(3, 'Lucía Torres', 'Roberto Gómez Bolaños', '10293847', '955443322', '2026-03-01', 1),
(4, 'Carlos Mendoza', 'Camila Valenzuela', '78945612', '998877665', '2026-04-05', 1),
(5, 'Lucía Torres', 'Diego Armando Rojas', '33445566', '944556677', '2026-05-12', 1),
(6, 'Lucía Torres', 'Andrea Carolina Morales', '87654321', '922334455', '2026-06-20', 1),
(7, 'Carlos Mendoza', 'Esteban Quispe Huamán', '55667788', '933221100', '2026-07-01', 0),
(8, 'Lucía Torres', 'Patricia Solano Reyes', '44332211', '911223344', '2026-08-15', 1),
(9, 'Carlos Mendoza', 'Juan Perez', '97888767', '983467869', '2026-10-05', 1);


INSERT IGNORE INTO membresias (id, socio_id, fecha_inicio, fecha_fin, monto_total, estado, es_primera) VALUES 
(1, 1, '2026-09-15', '2026-10-15', 120.00, 'activa', 1),
(2, 2, '2026-09-20', '2026-10-20', 255.00, 'activa', 0),
(3, 3, '2026-08-01', '2026-09-01', 120.00, 'vencida', 1),
(4, 4, '2026-09-10', '2026-10-10', 195.00, 'activa', 0),
(5, 7, '2026-07-01', '2026-08-01', 120.00, 'vencida', 1);


INSERT IGNORE INTO membresia_producto (id, membresia_id, producto_id, precio_unitario, cantidad_disponible) VALUES 
(1, 1, 1, 120.00, 1),
(2, 2, 1, 120.00, 1),
(3, 2, 3, 80.00, 1),
(4, 2, 6, 65.00, 1),
(5, 2, 8, 35.00, 1),
(6, 3, 1, 120.00, 1),
(7, 4, 1, 120.00, 1),
(8, 4, 4, 75.00, 1),
(9, 5, 1, 120.00, 1);

INSERT IGNORE INTO pases_invitado (id, socio_id, nombre_inv, fecha_uso, activo) VALUES 
(1, 1, 'Lucas Silva', '2026-09-18', 1),
(2, 2, 'Valeria Ríos', '2026-09-22', 1);


INSERT IGNORE INTO asistencias (id, socio_id, fecha_hora, sede) VALUES 
(1, 1, '2026-10-04 08:30:00', 'Sede Central'),
(2, 1, '2026-10-05 09:15:00', 'Sede Central'),
(3, 2, '2026-10-05 18:00:00', 'Sede Central'),
(4, 4, '2026-10-03 17:45:00', 'Sede Miraflores'),
(5, 7, '2026-07-15 10:00:00', 'Sede Central');