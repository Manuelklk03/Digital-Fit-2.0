package com.example.digital_fit.util;

/**
 * Utilidad de seguridad para sanitizar cadenas de texto antes de ser registradas en los logs.
 * Previene ataques de Log Injection (CWE-117 / Sonar java:S5145) reemplazando caracteres de
 * control de salto de línea (\r, \n) por guiones bajos.
 */
public final class LogSanitizer {

    private LogSanitizer() {
        // Constructor privado para clase utilitaria estática
    }

    /**
     * Sanitiza una cadena eliminando retornos de carro y saltos de línea.
     *
     * @param entrada Texto recibido (puede ser null)
     * @return Texto sanitizado con saltos de línea sustituidos por '_', o null si la entrada era null.
     */
    public static String sanitize(String entrada) {
        if (entrada == null) {
            return null;
        }
        return entrada.replaceAll("[\r\n]", "_");
    }
}
