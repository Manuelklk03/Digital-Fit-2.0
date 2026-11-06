package com.example.digital_fit.config;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class FlywayMigrationScriptsTest {

    private String readMigrationScript(String filename) throws Exception {
        try (InputStream in = getClass().getClassLoader().getResourceAsStream("db/migration/" + filename)) {
            assertNotNull(in, "El script de migracion " + filename + " debe existir en db/migration/");
            return new String(in.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    @Test
    @DisplayName("V1__esquema_inicial.sql contiene definicion de tablas esenciales")
    void testV1EsquemaInicial() throws Exception {
        String sql = readMigrationScript("V1__esquema_inicial.sql");
        assertTrue(sql.contains("CREATE TABLE IF NOT EXISTS usuarios"), "Debe crear tabla usuarios");
        assertTrue(sql.contains("CREATE TABLE IF NOT EXISTS entrenamientos_base"), "Debe crear entrenamientos_base");
        assertTrue(sql.contains("CREATE TABLE IF NOT EXISTS centros_privados_base"), "Debe crear centros_privados_base");
        assertTrue(sql.contains("CREATE TABLE IF NOT EXISTS lugares_publicos_base"), "Debe crear lugares_publicos_base");
        assertTrue(sql.contains("CREATE TABLE IF NOT EXISTS entrenamientos_usuario"), "Debe crear entrenamientos_usuario");
        assertTrue(sql.contains("CREATE TABLE IF NOT EXISTS historial_entrenamientos"), "Debe crear historial_entrenamientos");
        assertTrue(sql.contains("CREATE TABLE IF NOT EXISTS soporte"), "Debe crear soporte");
        assertTrue(sql.contains("CREATE TABLE IF NOT EXISTS valoraciones"), "Debe crear valoraciones");
    }

    @Test
    @DisplayName("V2__catalogos_base.sql contiene inserciones de catalogos base inmutables")
    void testV2CatalogosBase() throws Exception {
        String sql = readMigrationScript("V2__catalogos_base.sql");
        assertTrue(sql.contains("INSERT INTO entrenamientos_base"), "Debe insertar entrenamientos base");
        assertTrue(sql.contains("INSERT INTO centros_privados_base"), "Debe insertar centros privados base");
        assertTrue(sql.contains("INSERT INTO lugares_publicos_base"), "Debe insertar lugares publicos base");
        assertTrue(sql.contains("ON CONFLICT (nombre) DO NOTHING"), "Debe ser idempotente");
    }

    @Test
    @DisplayName("V3__usuarios_demo.sql contiene credenciales documentadas de admin1 y usuario1")
    void testV3UsuariosDemo() throws Exception {
        String sql = readMigrationScript("V3__usuarios_demo.sql");
        assertTrue(sql.contains("admin1"), "Debe insertar admin1");
        assertTrue(sql.contains("usuario1"), "Debe insertar usuario1");
        assertTrue(sql.contains("ADMIN"), "Debe asignar rol ADMIN a admin");
        assertTrue(sql.contains("USER"), "Debe asignar rol USER a usuario regular");
        assertTrue(sql.contains("ON CONFLICT (username) DO NOTHING"), "Debe ser idempotente");
    }
}
