package com.example.digital_fit.handler;

import java.net.URI;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.example.digital_fit.exception.EmailYaExisteException;
import com.example.digital_fit.exception.ErrorArgumentoException;
import com.example.digital_fit.exception.OperacionNoPermitida;
import com.example.digital_fit.exception.RecursoNoEncontradoException;
import com.example.digital_fit.exception.UsernameYaExiste;

/**
 * Manejador global de excepciones para la API REST.
 * Estandariza todas las respuestas de error bajo la especificación RFC 7807 (ProblemDetail).
 * Resuelve la deuda técnica P5.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(RecursoNoEncontradoException.class)
    public ProblemDetail handleRecursoNoEncontrado(RecursoNoEncontradoException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("Recurso no encontrado");
        problem.setType(URI.create("urn:problem-type:recurso-no-encontrado"));
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }

    @ExceptionHandler(UsernameYaExiste.class)
    public ProblemDetail handleUsernameYaExiste(UsernameYaExiste ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, ex.getMessage());
        problem.setTitle("Nombre de usuario no disponible");
        problem.setType(URI.create("urn:problem-type:username-duplicado"));
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }

    @ExceptionHandler(EmailYaExisteException.class)
    public ProblemDetail handleEmailYaExiste(EmailYaExisteException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, ex.getMessage());
        problem.setTitle("Correo electrónico duplicado");
        problem.setType(URI.create("urn:problem-type:email-duplicado"));
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }

    @ExceptionHandler(OperacionNoPermitida.class)
    public ProblemDetail handleOperacionNoPermitida(OperacionNoPermitida ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, ex.getMessage());
        problem.setTitle("Operación no permitida");
        problem.setType(URI.create("urn:problem-type:operacion-no-permitida"));
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ProblemDetail handleAccessDenied(AccessDeniedException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, "Acceso denegado: no tienes permisos para este recurso");
        problem.setTitle("Acceso denegado");
        problem.setType(URI.create("urn:problem-type:acceso-denegado"));
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }

    @ExceptionHandler(ErrorArgumentoException.class)
    public ProblemDetail handleErrorArgumento(ErrorArgumentoException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.getMessage());
        problem.setTitle("Parámetro inválido");
        problem.setType(URI.create("urn:problem-type:argumento-invalido"));
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidacionesDTO(MethodArgumentNotValidException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Los datos enviados no superaron las validaciones requeridas");
        problem.setTitle("Error de validación");
        problem.setType(URI.create("urn:problem-type:validacion-datos"));
        problem.setProperty("timestamp", Instant.now());

        Map<String, String> erroresPorCampo = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                erroresPorCampo.put(error.getField(), error.getDefaultMessage())
        );
        problem.setProperty("errores", erroresPorCampo);

        return problem;
    }

    @ExceptionHandler(Exception.class)
    public ProblemDetail handleExcepcionGeneral(Exception ex) {
        log.error("Error no controlado en el servidor: {}", ex.getMessage(), ex);
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, "Ha ocurrido un error interno en el servidor");
        problem.setTitle("Error interno del servidor");
        problem.setType(URI.create("urn:problem-type:error-interno"));
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }
}
