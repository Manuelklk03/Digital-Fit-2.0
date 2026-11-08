package com.example.digital_fit.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DisplayName("Validación del archivo docker-compose.prod.yml")
class ComposeProduccionTest {

    @Test
    @DisplayName("docker-compose.prod.yml usa imágenes publicadas y parámetros de producción")
    void composeProduccionConfiguracionValida() throws IOException {
        Path rutaCompose = Paths.get("../../docker-compose.prod.yml").toAbsolutePath().normalize();
        if (!Files.exists(rutaCompose)) {
            rutaCompose = Paths.get("docker-compose.prod.yml").toAbsolutePath().normalize();
        }
        assertTrue(Files.exists(rutaCompose), "El archivo docker-compose.prod.yml debe existir en la raíz");

        String contenido = Files.readString(rutaCompose);

        // 1. Debe usar las imágenes publicadas de Docker Hub y no build local
        assertTrue(contenido.contains("image: manuelklk03/digital-fit-backend"),
                "Debe usar la imagen del backend publicada en Docker Hub");
        assertTrue(contenido.contains("image: manuelklk03/digital-fit-frontend"),
                "Debe usar la imagen del frontend publicada en Docker Hub");
        assertFalse(contenido.contains("build:"),
                "docker-compose.prod.yml no debe incluir directivas build locales");

        // 2. Debe mantener healthcheck y depends_on service_healthy
        assertTrue(contenido.contains("service_healthy"),
                "Debe exigir service_healthy en los depends_on");
        assertTrue(contenido.contains("/actuator/health"),
                "El backend debe mantener el healthcheck en /actuator/health");

        // 3. Parámetros de entorno de producción
        assertTrue(contenido.contains("SPRING_PROFILES_ACTIVE: prod"),
                "Debe forzar perfil de producción SPRING_PROFILES_ACTIVE=prod");
        assertTrue(contenido.contains("SESSION_COOKIE_SECURE"),
                "Debe parametrizar SESSION_COOKIE_SECURE");
        assertTrue(contenido.contains("CORS_ALLOWED_ORIGINS"),
                "Debe parametrizar CORS_ALLOWED_ORIGINS");
    }
}
