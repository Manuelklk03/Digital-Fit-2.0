-- ===================================================================
-- V3__usuarios_demo.sql - Usuarios de demostración de Digital-Fit
-- Credenciales documentadas en docs/deployment.md (Tarea 4.5):
--   - admin1   / Admin123!   (ROL: ADMIN)
--   - usuario1 / Usuario123! (ROL: USER)
-- ===================================================================

INSERT INTO usuarios (username, email, password, rol)
VALUES 
    ('admin1', 'admin@digitalfit.com', '$2a$10$S3tQwJZtrEyaQkdbdptvxe.dvxr6yosKlbUHgWa.EPSYviqUesNbq', 'ADMIN'),
    ('usuario1', 'user@digitalfit.com', '$2a$10$DxFOrgNejnzMThd6HhM4.O0LCSMmtXmzcGN5SoTeIV.WbaRBkrnkW', 'USER')
ON CONFLICT (username) DO NOTHING;
