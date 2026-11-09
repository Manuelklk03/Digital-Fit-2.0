-- V4: Retirada de tablas del modulo de soporte y tickets (D13)
-- El backend y frontend de Digital-Fit 2.0 ya no gestionan tickets de soporte.

DROP TABLE IF EXISTS mensajes_soporte;
DROP TABLE IF EXISTS soporte;
