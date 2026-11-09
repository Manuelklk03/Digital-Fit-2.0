-- Ampliar columnas de texto libre (descripcion y comentario) a 1500 caracteres
-- para alinear el esquema relacional con las validaciones @Size(max = 1500) de los DTOs.

ALTER TABLE entrenamientos_base ALTER COLUMN descripcion TYPE VARCHAR(1500);
ALTER TABLE entrenamientos_usuario ALTER COLUMN descripcion TYPE VARCHAR(1500);
ALTER TABLE centros_privados_base ALTER COLUMN descripcion TYPE VARCHAR(1500);
ALTER TABLE centros_privados_usuario ALTER COLUMN descripcion TYPE VARCHAR(1500);
ALTER TABLE lugares_publicos_base ALTER COLUMN descripcion TYPE VARCHAR(1500);
ALTER TABLE lugares_publicos_usuario ALTER COLUMN descripcion TYPE VARCHAR(1500);
ALTER TABLE valoraciones ALTER COLUMN comentario TYPE VARCHAR(1500);
