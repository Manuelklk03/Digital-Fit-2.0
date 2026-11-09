-- ===================================================================
-- V5__actualizar_hashes_demo.sql - Actualización de hashes bcrypt
-- Corrige las contraseñas de demostración documentadas en docs/deployment.md:
--   - admin1   / Admin123!   (ROL: ADMIN)
--   - usuario1 / Usuario123! (ROL: USER)
-- ===================================================================

UPDATE usuarios 
SET password = '$2a$10$tMJqCjtSK68PxYhErmAFfuIZOf5ZpTRlEWWmZwXjokVDNNwMoCrdO'
WHERE username = 'admin1';

UPDATE usuarios 
SET password = '$2a$10$4qn9VQvoetOy.HGfFF4l3uyqa3JFtB1gJvsmP/Ousj3qepXcfw6TC'
WHERE username = 'usuario1';
