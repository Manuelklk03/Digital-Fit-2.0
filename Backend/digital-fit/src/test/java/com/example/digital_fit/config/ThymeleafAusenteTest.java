package com.example.digital_fit.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertThrows;

@DisplayName("Comprobación de ausencia de dependencias Thymeleaf")
class ThymeleafAusenteTest {

    @Test
    @DisplayName("Garantizar que el motor de plantillas Thymeleaf no está presente en el classpath")
    void thymeleafNoEstaEnElClasspath() {
        assertThrows(ClassNotFoundException.class, () -> {
            Class.forName("org.thymeleaf.TemplateEngine");
        }, "La clase org.thymeleaf.TemplateEngine no debería estar presente en el classpath tras retirar el starter");
    }
}
