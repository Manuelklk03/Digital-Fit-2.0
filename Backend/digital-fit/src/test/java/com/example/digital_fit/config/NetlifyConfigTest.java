package com.example.digital_fit.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DisplayName("Validación del archivo netlify.toml")
class NetlifyConfigTest {

    @Test
    @DisplayName("netlify.toml define proxy para /api/* y redirección SPA para Angular")
    void netlifyConfigValida() throws IOException {
        Path rutaNetlify = Paths.get("../../netlify.toml").toAbsolutePath().normalize();
        if (!Files.exists(rutaNetlify)) {
            rutaNetlify = Paths.get("netlify.toml").toAbsolutePath().normalize();
        }
        assertTrue(Files.exists(rutaNetlify), "El archivo netlify.toml debe existir en la raíz del repositorio");

        String contenido = Files.readString(rutaNetlify);

        // 1. Debe definir la carpeta de publicación y comando de build
        assertTrue(contenido.contains("base = \"Frontend/digital-fit-frontend\""),
                "Debe indicar la carpeta base del frontend");
        assertTrue(contenido.contains("publish = \"dist/digital-fit-frontend/browser\""),
                "Debe publicar la salida de Angular dist");

        // 2. Debe configurar el proxy inverso hacia el backend (D2, D9)
        assertTrue(contenido.contains("from = \"/api/*\""),
                "Debe definir regla de redirección proxy para /api/*");
        assertTrue(contenido.contains("status = 200"),
                "El proxy debe devolver status 200 (rewrite transparente)");

        // 3. Debe incluir redirección SPA a /index.html
        assertTrue(contenido.contains("from = \"/*\""),
                "Debe definir fallback SPA para rutas de Angular");
        assertTrue(contenido.contains("to = \"/index.html\""),
                "Debe reenviar las rutas no coincidentes a /index.html");
    }
}
