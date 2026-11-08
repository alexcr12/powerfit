SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS membresia_producto;
DROP TABLE IF EXISTS categoria_beneficios_base;

ALTER TABLE categorias DROP COLUMN precio;
ALTER TABLE productos DROP COLUMN precio_base, DROP COLUMN sede;
ALTER TABLE productos ADD COLUMN requiere_asistencia BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE membresias DROP COLUMN estado, DROP COLUMN es_primera;
ALTER TABLE membresias ADD COLUMN categoria_id BIGINT NOT NULL;
ALTER TABLE membresias ADD COLUMN activo BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE asistencias DROP COLUMN sede;
ALTER TABLE asistencias ADD COLUMN producto_id BIGINT NOT NULL;

ALTER TABLE socios ADD COLUMN registrado_por_id BIGINT NULL;
UPDATE socios s
LEFT JOIN usuarios u ON u.nombre = s.registrado_por
SET s.registrado_por_id = COALESCE(u.id, (SELECT admin_user.id FROM (SELECT id FROM usuarios WHERE email = 'admin@powerfit.com' ORDER BY id LIMIT 1) admin_user));
ALTER TABLE socios DROP COLUMN registrado_por;
ALTER TABLE socios CHANGE COLUMN registrado_por_id registrado_por BIGINT NOT NULL;
ALTER TABLE socios ADD CONSTRAINT fk_socios_registrado_por FOREIGN KEY (registrado_por) REFERENCES usuarios(id);

ALTER TABLE usuarios ADD COLUMN activo BOOLEAN NOT NULL DEFAULT TRUE;

SET FOREIGN_KEY_CHECKS = 1;
