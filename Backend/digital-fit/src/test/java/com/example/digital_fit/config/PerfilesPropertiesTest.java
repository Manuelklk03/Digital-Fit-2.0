package com.example.digital_fit.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.io.InputStream;
import java.util.Properties;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class PerfilesPropertiesTest {

    private Properties loadProperties(String filename) throws Exception {
        Properties props = new Properties();
        try (InputStream in = getClass().getClassLoader().getResourceAsStream(filename)) {
            assertNotNull(in, "El archivo " + filename + " debe existir en el classpath");
            props.load(in);
        }
        return props;
    }

    @Test
    @DisplayName("application.properties define perfil dev por defecto y configuracion comun")
    void testApplicationPropertiesBase() throws Exception {
        Properties base = loadProperties("application.properties");
        assertEquals("digital_fit", base.getProperty("spring.application.name"));
        assertEquals("${SPRING_PROFILES_ACTIVE:dev}", base.getProperty("spring.profiles.active"));
        assertEquals("true", base.getProperty("spring.flyway.enabled"));
        assertEquals("true", base.getProperty("server.servlet.session.cookie.http-only"));
        assertEquals("lax", base.getProperty("server.servlet.session.cookie.same-site"));
    }

    @Test
    @DisplayName("application-dev.properties activa show-sql y logs DEBUG para desarrollo")
    void testApplicationDevProperties() throws Exception {
        Properties dev = loadProperties("application-dev.properties");
        assertEquals("true", dev.getProperty("spring.jpa.show-sql"));
        assertEquals("true", dev.getProperty("spring.jpa.properties.hibernate.format_sql"));
        assertEquals("DEBUG", dev.getProperty("logging.level.com.example.digital_fit"));
        assertEquals("logs/digitalfit-dev.log", dev.getProperty("logging.file.name"));
    }

    @Test
    @DisplayName("application-staging.properties valida esquema y configura logs para preproduccion")
    void testApplicationStagingProperties() throws Exception {
        Properties staging = loadProperties("application-staging.properties");
        assertEquals("validate", staging.getProperty("spring.jpa.hibernate.ddl-auto"));
        assertEquals("false", staging.getProperty("spring.jpa.show-sql"));
        assertEquals("false", staging.getProperty("spring.jpa.properties.hibernate.format_sql"));
        assertEquals("INFO", staging.getProperty("logging.level.com.example.digital_fit"));
        assertEquals("never", staging.getProperty("server.error.include-stacktrace"));
        assertEquals("logs/digitalfit-staging.log", staging.getProperty("logging.file.name"));
    }

    @Test
    @DisplayName("application-prod.properties desactiva show-sql y configura logs seguros para produccion")
    void testApplicationProdProperties() throws Exception {
        Properties prod = loadProperties("application-prod.properties");
        assertEquals("validate", prod.getProperty("spring.jpa.hibernate.ddl-auto"));
        assertEquals("false", prod.getProperty("spring.jpa.show-sql"));
        assertEquals("false", prod.getProperty("spring.jpa.properties.hibernate.format_sql"));
        assertEquals("INFO", prod.getProperty("logging.level.com.example.digital_fit"));
        assertEquals("WARN", prod.getProperty("logging.level.root"));
        assertEquals("never", prod.getProperty("server.error.include-stacktrace"));
        assertEquals("logs/digitalfit.log", prod.getProperty("logging.file.name"));
    }
}
