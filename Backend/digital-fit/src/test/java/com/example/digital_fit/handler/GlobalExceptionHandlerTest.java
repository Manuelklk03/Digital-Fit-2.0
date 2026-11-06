package com.example.digital_fit.handler;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import com.example.digital_fit.exception.EmailYaExisteException;
import com.example.digital_fit.exception.ErrorArgumentoException;
import com.example.digital_fit.exception.OperacionNoPermitida;
import com.example.digital_fit.exception.RecursoNoEncontradoException;
import com.example.digital_fit.exception.UsernameYaExiste;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler handler;

    @BeforeEach
    void setUp() {
        handler = new GlobalExceptionHandler();
    }

    @Test
    void testHandleRecursoNoEncontrado() {
        RecursoNoEncontradoException ex = new RecursoNoEncontradoException("Centro no encontrado");
        ProblemDetail problem = handler.handleRecursoNoEncontrado(ex);

        assertNotNull(problem);
        assertEquals(HttpStatus.NOT_FOUND.value(), problem.getStatus());
        assertEquals("Recurso no encontrado", problem.getTitle());
        assertEquals("Centro no encontrado", problem.getDetail());
        assertNotNull(problem.getProperties().get("timestamp"));
    }

    @Test
    void testHandleUsernameYaExiste() {
        UsernameYaExiste ex = new UsernameYaExiste("Usuario ya en uso");
        ProblemDetail problem = handler.handleUsernameYaExiste(ex);

        assertNotNull(problem);
        assertEquals(HttpStatus.CONFLICT.value(), problem.getStatus());
        assertEquals("Nombre de usuario no disponible", problem.getTitle());
        assertEquals("Usuario ya en uso", problem.getDetail());
    }

    @Test
    void testHandleEmailYaExiste() {
        EmailYaExisteException ex = new EmailYaExisteException("Email duplicado");
        ProblemDetail problem = handler.handleEmailYaExiste(ex);

        assertNotNull(problem);
        assertEquals(HttpStatus.CONFLICT.value(), problem.getStatus());
        assertEquals("Correo electrónico duplicado", problem.getTitle());
        assertEquals("Email duplicado", problem.getDetail());
    }

    @Test
    void testHandleOperacionNoPermitida() {
        OperacionNoPermitida ex = new OperacionNoPermitida("No puedes modificar este registro");
        ProblemDetail problem = handler.handleOperacionNoPermitida(ex);

        assertNotNull(problem);
        assertEquals(HttpStatus.FORBIDDEN.value(), problem.getStatus());
        assertEquals("Operación no permitida", problem.getTitle());
        assertEquals("No puedes modificar este registro", problem.getDetail());
    }

    @Test
    void testHandleAccessDenied() {
        AccessDeniedException ex = new AccessDeniedException("Forbidden");
        ProblemDetail problem = handler.handleAccessDenied(ex);

        assertNotNull(problem);
        assertEquals(HttpStatus.FORBIDDEN.value(), problem.getStatus());
        assertEquals("Acceso denegado", problem.getTitle());
        assertTrue(problem.getDetail().contains("Acceso denegado"));
    }

    @Test
    void testHandleErrorArgumento() {
        ErrorArgumentoException ex = new ErrorArgumentoException("Parámetro inválido");
        ProblemDetail problem = handler.handleErrorArgumento(ex);

        assertNotNull(problem);
        assertEquals(HttpStatus.BAD_REQUEST.value(), problem.getStatus());
        assertEquals("Parámetro inválido", problem.getTitle());
        assertEquals("Parámetro inválido", problem.getDetail());
    }

    @Test
    @SuppressWarnings("unchecked")
    void testHandleValidacionesDTO() {
        MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
        BindingResult bindingResult = mock(BindingResult.class);

        FieldError fieldError = new FieldError("usuarioDTO", "username", "El campo no puede estar vacío");
        when(bindingResult.getFieldErrors()).thenReturn(List.of(fieldError));
        when(ex.getBindingResult()).thenReturn(bindingResult);

        ProblemDetail problem = handler.handleValidacionesDTO(ex);

        assertNotNull(problem);
        assertEquals(HttpStatus.BAD_REQUEST.value(), problem.getStatus());
        assertEquals("Error de validación", problem.getTitle());

        Map<String, String> errores = (Map<String, String>) problem.getProperties().get("errores");
        assertNotNull(errores);
        assertEquals("El campo no puede estar vacío", errores.get("username"));
    }

    @Test
    void testHandleExcepcionGeneral() {
        Exception ex = new RuntimeException("Error inesperado en BD");
        ProblemDetail problem = handler.handleExcepcionGeneral(ex);

        assertNotNull(problem);
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR.value(), problem.getStatus());
        assertEquals("Error interno del servidor", problem.getTitle());
        assertEquals("Ha ocurrido un error interno en el servidor", problem.getDetail());
    }
}
