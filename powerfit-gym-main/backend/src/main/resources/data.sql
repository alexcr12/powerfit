INSERT INTO usuarios (id, nombre, email, password, rol) 
VALUES (1, 'Administrador', 'admin@powerfit.com', 'admin123', 'admin')
ON DUPLICATE KEY UPDATE nombre=nombre;