package com.example.digital_fit.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DisplayName("Validación del workflow de CI/CD para deploy hook")
class CiWorkflowTest {

    @Test
    @DisplayName("El workflow ci.yml incluye el paso de deploy hook condicional y seguro")
    void workflowContienePasoDeployHookSeguro() throws IOException {
        Path rutaWorkflow = Paths.get("../../.github/workflows/ci.yml").toAbsolutePath().normalize();
        if (!Files.exists(rutaWorkflow)) {
            rutaWorkflow = Paths.get(".github/workflows/ci.yml").toAbsolutePath().normalize();
        }
        assertTrue(Files.exists(rutaWorkflow), "El archivo .github/workflows/ci.yml debe existir");

        String contenido = Files.readString(rutaWorkflow);

        // 1. Debe existir el paso de deploy hook para backend
        assertTrue(contenido.contains("Notificar deploy hook en Render (backend)"),
                "Debe existir el paso de notificación de deploy hook para Render");

        // 2. Debe ejecutarse solo para backend, en main y omitirse si el secreto no existe
        assertTrue(contenido.contains("matrix.imagen == 'backend'"),
                "El deploy hook debe aplicar a la imagen de backend");
        assertTrue(contenido.contains("github.ref == 'refs/heads/main'"),
                "El deploy hook debe ejecutarse en merge a main");
        assertTrue(contenido.contains("[ -n \"$RENDER_DEPLOY_HOOK\" ]"),
                "El deploy hook debe comprobar que la variable RENDER_DEPLOY_HOOK está definida");

        // 3. Debe realizar la llamada curl usando variable de entorno
        assertTrue(contenido.contains("curl -fsS -X POST \"$RENDER_DEPLOY_HOOK\""),
                "Debe invocar curl pasando la variable de entorno RENDER_DEPLOY_HOOK");

        // 4. Seguridad: nunca debe imprimir el valor del secreto
        assertFalse(contenido.contains("echo $RENDER_DEPLOY_HOOK") || contenido.contains("echo \"$RENDER_DEPLOY_HOOK\""),
                "El workflow jamás debe imprimir el contenido del secreto RENDER_DEPLOY_HOOK");
    }
}
