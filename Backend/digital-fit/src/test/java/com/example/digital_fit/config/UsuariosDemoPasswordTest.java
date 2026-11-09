package com.example.digital_fit.config;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

class UsuariosDemoPasswordTest {

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Test
    @DisplayName("Los hashes bcrypt de V5 coinciden exactamente con las contraseñas documentadas en deployment.md")
    void testHashesV5CoincidenConCredencialesDocumentadas() throws Exception {
        String scriptV5;
        try (InputStream in = getClass().getClassLoader().getResourceAsStream("db/migration/V5__actualizar_hashes_demo.sql")) {
            assertNotNull(in, "El script V5__actualizar_hashes_demo.sql debe existir");
            scriptV5 = new String(in.readAllBytes(), StandardCharsets.UTF_8);
        }

        // Extraer hash de admin1
        Pattern adminPattern = Pattern.compile("password\\s*=\\s*'([^']+)'\\s*WHERE\\s*username\\s*=\\s*'admin1'", Pattern.CASE_INSENSITIVE);
        Matcher adminMatcher = adminPattern.matcher(scriptV5);
        assertTrue(adminMatcher.find(), "Debe encontrarse el UPDATE de password para admin1");
        String adminHash = adminMatcher.group(1);

        // Extraer hash de usuario1
        Pattern userPattern = Pattern.compile("password\\s*=\\s*'([^']+)'\\s*WHERE\\s*username\\s*=\\s*'usuario1'", Pattern.CASE_INSENSITIVE);
        Matcher userMatcher = userPattern.matcher(scriptV5);
        assertTrue(userMatcher.find(), "Debe encontrarse el UPDATE de password para usuario1");
        String userHash = userMatcher.group(1);

        // Credenciales documentadas en docs/deployment.md (Tarea 4.5):
        // admin1 -> Admin123!
        // usuario1 -> Usuario123!
        assertTrue(passwordEncoder.matches("Admin123!", adminHash),
                "El hash de admin1 debe coincidir con 'Admin123!'");
        assertTrue(passwordEncoder.matches("Usuario123!", userHash),
                "El hash de usuario1 debe coincidir con 'Usuario123!'");
    }
}
