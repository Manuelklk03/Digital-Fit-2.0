-- ===================================================================
-- V2__catalogos_base.sql - Catálogos base de Digital-Fit
-- 10 Entrenamientos base, 6 Centros privados base, 8 Lugares públicos
-- ===================================================================

-- 1. Insertar entrenamientos base
INSERT INTO entrenamientos_base (nombre, descripcion, categoria, nivel, duracion_en_minutos)
VALUES 
    ('Full Body Principiante', 'Rutina completa para principiantes: sentadillas, flexiones y abdominales para trabajar todo el cuerpo.', 'FUERZA_TOTAL', 'PRINCIPIANTE', 30),
    ('Cardio Running Río Turia', 'Entrenamiento de running continuo por el río Turia para mejorar la resistencia cardiovascular.', 'RUNNING', 'INTERMEDIO', 40),
    ('HIIT 20 minutos', 'Entrenamiento HIIT con intervalos de alta intensidad: burpees, jumping jacks y mountain climbers.', 'HIIT', 'AVANZADO', 20),
    ('Piernas y Glúteos', 'Rutina centrada en tren inferior con sentadillas, zancadas y peso muerto.', 'FUERZA_TREN_INFERIOR', 'INTERMEDIO', 35),
    ('Espalda y Bíceps', 'Entrenamiento de fuerza para tren superior: dominadas, remo y curl de bíceps.', 'FUERZA_TREN_SUPERIOR', 'INTERMEDIO', 35),
    ('Calistenia en Parque', 'Rutina de calistenia usando barras de parque: dominadas, fondos y abdominales.', 'CALISTENIA_BASICA', 'INTERMEDIO', 30),
    ('Movilidad y Estiramientos', 'Rutina ligera para mejorar movilidad articular y flexibilidad después del entrenamiento.', 'MOVILIDAD', 'PRINCIPIANTE', 15),
    ('Ciclismo Resistencia', 'Entrenamiento largo de ciclismo para mejorar resistencia cardiovascular.', 'CICLISMO', 'INTERMEDIO', 60),
    ('Crossfit Circuito', 'Circuito funcional de alta intensidad combinando fuerza y cardio.', 'CROSSFIT', 'AVANZADO', 30),
    ('Recuperación Activa', 'Ejercicios suaves de recuperación y estiramientos para después de entrenamientos intensos.', 'RECUPERACION', 'PRINCIPIANTE', 20)
ON CONFLICT (nombre) DO NOTHING;

-- 2. Insertar centros privados base
INSERT INTO centros_privados_base (nombre, direccion, telefono, horario, precio_mensual, descripcion, latitud, longitud)
VALUES 
    ('AltaFit Valencia Centro', 'Calle Xàtiva 14, Valencia', '960111111', 'L-V 7:00-23:00', 29.90, 'Gimnasio moderno en el centro con zona de musculación y clases dirigidas.', 39.4699, -0.3763),
    ('DreamFit Valencia', 'Av. del Cid 62, Valencia', '961222222', 'L-D 6:00-24:00', 24.90, 'Gimnasio amplio con zona cardio y entrenamiento funcional.', 39.4712, -0.3974),
    ('Basic-Fit Valencia Ruzafa', 'Carrer de Cadis 10, Valencia', '962333333', 'L-D 6:00-23:00', 19.99, 'Centro económico con máquinas modernas.', 39.4637, -0.3704),
    ('Synergym Valencia', 'Av. del Puerto 123, Valencia', '963444444', 'L-D 6:00-24:00', 26.99, 'Gimnasio completo con zona cross training.', 39.4630, -0.3405),
    ('Fitness Park Valencia', 'Calle Menorca 19, Valencia', '964555555', 'L-D 6:00-23:30', 27.99, 'Centro con maquinaria profesional y zona funcional.', 39.4587, -0.3320),
    ('Metropolitan Valencia', 'Av. de Francia 20, Valencia', '965666666', 'L-D 7:00-22:00', 49.90, 'Centro premium con piscina y spa.', 39.4561, -0.3468)
ON CONFLICT (nombre) DO NOTHING;

-- 3. Insertar lugares públicos base
INSERT INTO lugares_publicos_base (nombre, direccion, descripcion, telefono, horario, latitud, longitud, tipo)
VALUES 
    ('Jardín del Turia', 'Antiguo cauce del río Turia, Valencia', 'Gran parque urbano ideal para correr, entrenar calistenia y ciclismo.', NULL, 'Abierto 24h', 39.4789, -0.3797, 'PARQUE_PUBLICO'),
    ('Playa de la Malvarrosa', 'Paseo Marítimo, Valencia', 'Playa amplia perfecta para running, voley playa y entrenamiento funcional.', NULL, 'Abierto 24h', 39.4769, -0.3233, 'PLAYA_DEPORTIVA'),
    ('Parque de Cabecera', 'Av. Pío Baroja, Valencia', 'Gran zona verde con espacios amplios para correr y entrenar al aire libre.', NULL, 'Abierto 24h', 39.4935, -0.4090, 'PARQUE_PUBLICO'),
    ('Zona Calistenia Río Turia', 'Tramo 5 del Jardín del Turia', 'Zona equipada con barras para dominadas y entrenamiento funcional.', NULL, 'Abierto 24h', 39.4745, -0.3771, 'PARQUE_CALISTENIA'),
    ('Carril Bici Valencia Centro', 'Centro histórico de Valencia', 'Red de carriles bici ideal para entrenamientos de ciclismo.', NULL, 'Abierto 24h', 39.4699, -0.3763, 'CARRIL_BICI'),
    ('Polideportivo Municipal Benimaclet', 'Carrer Daniel Balaciart, Valencia', 'Complejo deportivo municipal con pistas y actividades deportivas.', '963123456', 'L-V 8:00-22:00', 39.4844, -0.3649, 'ZONA_MULTIDEPORTE'),
    ('Ruta Running Jardín del Turia', 'Jardín del Turia tramo central', 'Ruta muy utilizada por corredores con varios kilómetros continuos.', NULL, 'Abierto 24h', 39.4700, -0.3765, 'RUTA_RUNNING'),
    ('Circuito Ciclismo Turia', 'Tramo final Jardín del Turia', 'Zona popular para entrenamientos de ciclismo y rodillo urbano.', NULL, 'Abierto 24h', 39.4805, -0.3872, 'CIRCUITO_CICLISMO')
ON CONFLICT (nombre) DO NOTHING;
