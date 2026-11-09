package com.example.digital_fit.controller;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.example.digital_fit.config.SecurityConfig;
import com.example.digital_fit.controller.Auth.AdminRestController;
import com.example.digital_fit.controller.Auth.AuthController;
import com.example.digital_fit.controller.Valoracion.ValoracionRestController;
import com.example.digital_fit.handler.GlobalExceptionHandler;
import com.example.digital_fit.service.Auth.AuthService;
import com.example.digital_fit.service.Valoracion.ValoracionService;

@WebMvcTest(controllers = {
        ValoracionRestController.class,
        AdminRestController.class,
        AuthController.class
})
@Import({SecurityConfig.class, GlobalExceptionHandler.class})
@DisplayName("Pruebas WebMvc de validaciones Bean Validation en endpoints REST")
class ValidacionRestControllersTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ValoracionService valoracionService;

    @MockitoBean
    private AuthService authService;

    @Test
    @DisplayName("POST /api/valoraciones devuelve 400 ProblemDetail si comentario supera 1500 caracteres")
    void testCrearValoracionComentarioMayor1500_Devuelve400ProblemDetail() throws Exception {
        String comentarioLargo = "a".repeat(1501);
        String bodyJson = """
                {
                    "puntuacion": 5,
                    "comentario": "%s"
                }
                """.formatted(comentarioLargo);

        mockMvc.perform(post("/api/valoraciones/ENTRENAMIENTO_BASE/1")
                        .with(user("usuario1").roles("USER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bodyJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.title").value("Error de validación"))
                .andExpect(jsonPath("$.type").value("urn:problem-type:validacion-datos"))
                .andExpect(jsonPath("$.errores.comentario").exists());
    }

    @Test
    @DisplayName("POST /api/valoraciones devuelve 400 ProblemDetail si puntuacion es menor que 1")
    void testCrearValoracionPuntuacionMenor1_Devuelve400ProblemDetail() throws Exception {
        String bodyJson = """
                {
                    "puntuacion": 0,
                    "comentario": "Buen entrenamiento"
                }
                """;

        mockMvc.perform(post("/api/valoraciones/ENTRENAMIENTO_BASE/1")
                        .with(user("usuario1").roles("USER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bodyJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.title").value("Error de validación"))
                .andExpect(jsonPath("$.errores.puntuacion").exists());
    }

    @Test
    @DisplayName("POST /api/valoraciones devuelve 400 ProblemDetail si puntuacion es mayor que 5")
    void testCrearValoracionPuntuacionMayor5_Devuelve400ProblemDetail() throws Exception {
        String bodyJson = """
                {
                    "puntuacion": 6,
                    "comentario": "Excelente"
                }
                """;

        mockMvc.perform(post("/api/valoraciones/ENTRENAMIENTO_BASE/1")
                        .with(user("usuario1").roles("USER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bodyJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.title").value("Error de validación"))
                .andExpect(jsonPath("$.errores.puntuacion").exists());
    }

    @Test
    @DisplayName("POST /api/admin/crear-admin devuelve 400 ProblemDetail si password tiene menos de 6 caracteres")
    void testCrearAdminPasswordMenor6Caracteres_Devuelve400ProblemDetail() throws Exception {
        String bodyJson = """
                {
                    "username": "nuevoAdmin",
                    "password": "12345",
                    "email": "nuevo@admin.com"
                }
                """;

        mockMvc.perform(post("/api/admin/crear-admin")
                        .with(user("admin1").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bodyJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.title").value("Error de validación"))
                .andExpect(jsonPath("$.errores.password").exists());
    }

    @Test
    @DisplayName("POST /api/auth/registro devuelve 400 ProblemDetail si password tiene menos de 6 caracteres")
    void testRegistroPasswordMenor6Caracteres_Devuelve400ProblemDetail() throws Exception {
        String bodyJson = """
                {
                    "username": "nuevoUsuario",
                    "password": "12345",
                    "email": "nuevo@usuario.com"
                }
                """;

        mockMvc.perform(post("/api/auth/registro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bodyJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.title").value("Error de validación"))
                .andExpect(jsonPath("$.errores.password").exists());
    }
}
