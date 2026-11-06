package com.example.digital_fit.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class LogSanitizerTest {

    @Test
    @DisplayName("Debe retornar null cuando la entrada sea null")
    void sanitize_entradaNull_retornaNull() {
        assertNull(LogSanitizer.sanitize(null));
    }

    @Test
    @DisplayName("Debe devolver la misma cadena si no contiene saltos de línea")
    void sanitize_cadenaLimpia_retornaMismaCadena() {
        String texto = "usuarioValido123";
        assertEquals("usuarioValido123", LogSanitizer.sanitize(texto));
    }

    @Test
    @DisplayName("Debe sustituir retornos de carro y saltos de línea por guiones bajos")
    void sanitize_cadenaConSaltosDeLinea_sustituyePorGuionesBajos() {
        String intentoAtaque = "admin\r\nINFO: Evento falso inyectado\nOtra linea";
        String resultado = LogSanitizer.sanitize(intentoAtaque);

        assertFalse(resultado.contains("\r"));
        assertFalse(resultado.contains("\n"));
        assertEquals("admin__INFO: Evento falso inyectado_Otra linea", resultado);
    }
}
