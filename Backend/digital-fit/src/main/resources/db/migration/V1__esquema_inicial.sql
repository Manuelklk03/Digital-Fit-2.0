-- ===================================================================
-- V1__esquema_inicial.sql - Esquema inicial relacional de Digital-Fit
-- Base de datos: PostgreSQL 17 (Decisión D3, Deuda técnica P4)
-- ===================================================================

-- 1. Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL
);

-- 2. Catálogos base
CREATE TABLE IF NOT EXISTS entrenamientos_base (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE,
    descripcion VARCHAR(1000) NOT NULL,
    categoria VARCHAR(50),
    nivel VARCHAR(50),
    duracion_en_minutos INTEGER
);

CREATE TABLE IF NOT EXISTS centros_privados_base (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE,
    direccion VARCHAR(255) NOT NULL,
    telefono VARCHAR(255),
    horario VARCHAR(255),
    precio_mensual DOUBLE PRECISION,
    descripcion VARCHAR(1000),
    latitud DOUBLE PRECISION,
    longitud DOUBLE PRECISION,
    osm_id BIGINT
);

CREATE TABLE IF NOT EXISTS lugares_publicos_base (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE,
    direccion VARCHAR(255) NOT NULL,
    descripcion VARCHAR(1000),
    telefono VARCHAR(255),
    horario VARCHAR(255),
    latitud DOUBLE PRECISION,
    longitud DOUBLE PRECISION,
    tipo VARCHAR(50) NOT NULL,
    osm_id BIGINT
);

-- 3. Entidades de usuario y comunidad
CREATE TABLE IF NOT EXISTS entrenamientos_comunidad (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion VARCHAR(2000) NOT NULL,
    categoria VARCHAR(50),
    nivel VARCHAR(50),
    duracion_en_minutos INTEGER,
    fecha_publicacion TIMESTAMP,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS entrenamientos_usuario (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion VARCHAR(1000) NOT NULL,
    categoria VARCHAR(50),
    nivel VARCHAR(50),
    duracion_en_minutos INTEGER,
    activo BOOLEAN DEFAULT TRUE,
    entrenamiento_base_origen_id BIGINT REFERENCES entrenamientos_base(id) ON DELETE SET NULL,
    entrenamiento_comunidad_origen_id BIGINT REFERENCES entrenamientos_comunidad(id) ON DELETE SET NULL,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS centros_privados_usuario (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    telefono VARCHAR(255),
    horario VARCHAR(255),
    precio_mensual DOUBLE PRECISION,
    descripcion VARCHAR(1000),
    latitud DOUBLE PRECISION,
    longitud DOUBLE PRECISION,
    activo BOOLEAN DEFAULT TRUE,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS lugares_publicos_usuario (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    direccion VARCHAR(255),
    descripcion VARCHAR(1000),
    telefono VARCHAR(255),
    horario VARCHAR(255),
    latitud DOUBLE PRECISION,
    longitud DOUBLE PRECISION,
    tipo VARCHAR(50),
    activo BOOLEAN DEFAULT TRUE,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 4. Historial de entrenamientos
CREATE TABLE IF NOT EXISTS historial_entrenamientos (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    entrenamiento_base_id BIGINT REFERENCES entrenamientos_base(id) ON DELETE SET NULL,
    entrenamiento_usuario_id BIGINT REFERENCES entrenamientos_usuario(id) ON DELETE SET NULL,
    lugar_publico_base_id BIGINT REFERENCES lugares_publicos_base(id) ON DELETE SET NULL,
    lugar_publico_usuario_id BIGINT REFERENCES lugares_publicos_usuario(id) ON DELETE SET NULL,
    centro_privado_base_id BIGINT REFERENCES centros_privados_base(id) ON DELETE SET NULL,
    centro_privado_usuario_id BIGINT REFERENCES centros_privados_usuario(id) ON DELETE SET NULL,
    fecha_hora TIMESTAMP,
    duracion_minutos INTEGER,
    notas VARCHAR(2000)
);

-- 5. Soporte y tickets
CREATE TABLE IF NOT EXISTS soporte (
    id BIGSERIAL PRIMARY KEY,
    asunto VARCHAR(1000) NOT NULL,
    mensaje VARCHAR(1000) NOT NULL,
    fecha TIMESTAMP,
    estado VARCHAR(50) NOT NULL,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mensajes_soporte (
    id BIGSERIAL PRIMARY KEY,
    contenido VARCHAR(2000) NOT NULL,
    fecha TIMESTAMP NOT NULL,
    ticket_id BIGINT NOT NULL REFERENCES soporte(id) ON DELETE CASCADE,
    emisor_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 6. Valoraciones
CREATE TABLE IF NOT EXISTS valoraciones (
    id BIGSERIAL PRIMARY KEY,
    puntuacion INTEGER NOT NULL,
    comentario VARCHAR(1000),
    fecha TIMESTAMP,
    tipo_valoracion VARCHAR(50) NOT NULL,
    id_relacionado BIGINT NOT NULL,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT uk_valoracion_usuario_tipo_id UNIQUE (usuario_id, tipo_valoracion, id_relacionado)
);
