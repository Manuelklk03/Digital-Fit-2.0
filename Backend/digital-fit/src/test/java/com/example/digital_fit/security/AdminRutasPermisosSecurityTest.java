package com.example.digital_fit.security;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
import com.example.digital_fit.controller.CentroPrivado.Admin.CentroPrivadoBaseAdminRestController;
import com.example.digital_fit.controller.Entrenamientos.Admin.EntrenamientoBaseAdminRestController;
import com.example.digital_fit.controller.LugarPublico.Admin.LugarPublicoBaseAdminRestController;
import com.example.digital_fit.dto.CentroPrivado.CentroPrivadoBaseDTO;
import com.example.digital_fit.dto.Entrenamientos.EntrenamientoBaseDTO;
import com.example.digital_fit.dto.LugarPublico.LugarPublicoBaseDTO;
import com.example.digital_fit.handler.GlobalExceptionHandler;
import com.example.digital_fit.service.Auth.AuthService;
import com.example.digital_fit.service.CentroPrivado.CentroPrivadoBaseService;
import com.example.digital_fit.service.Entrenamientos.EntrenamientoBaseService;
import com.example.digital_fit.service.LugarPublico.LugarPublicoBaseService;

@WebMvcTest(controllers = {
        AdminRestController.class,
        EntrenamientoBaseAdminRestController.class,
        CentroPrivadoBaseAdminRestController.class,
        LugarPublicoBaseAdminRestController.class
})
@Import({SecurityConfig.class, GlobalExceptionHandler.class})
class AdminRutasPermisosSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private EntrenamientoBaseService entrenamientoBaseService;

    @MockitoBean
    private CentroPrivadoBaseService centroPrivadoBaseService;

    @MockitoBean
    private LugarPublicoBaseService lugarPublicoBaseService;

    // --- 1. ACCESO NO AUTENTICADO (ANÓNIMO: 401 UNAUTHORIZED) ---

    @Test
    @DisplayName("POST /api/admin/crear-admin sin autenticación retorna 401 Unauthorized")
    void testCrearAdminAnonimoRetorna401() throws Exception {
        mockMvc.perform(post("/api/admin/crear-admin")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"nuevoAdmin\",\"email\":\"admin@test.com\",\"password\":\"Admin123!\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/admin/entrenamientos-base sin autenticación retorna 401 Unauthorized")
    void testEntrenamientosBaseAnonimoRetorna401() throws Exception {
        mockMvc.perform(post("/api/admin/entrenamientos-base")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"nombre\":\"Fuerza\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("DELETE /api/admin/centros-privados-base/1 sin autenticación retorna 401 Unauthorized")
    void testCentrosPrivadosBaseAnonimoRetorna401() throws Exception {
        mockMvc.perform(delete("/api/admin/centros-privados-base/1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("DELETE /api/admin/lugares-publicos-base/1 sin autenticación retorna 401 Unauthorized")
    void testLugaresPublicosBaseAnonimoRetorna401() throws Exception {
        mockMvc.perform(delete("/api/admin/lugares-publicos-base/1"))
                .andExpect(status().isUnauthorized());
    }

    // --- 2. ACCESO CON ROL USER (NO AUTORIZADO: 403 FORBIDDEN) ---

    @Test
    @DisplayName("POST /api/admin/crear-admin con rol USER retorna 403 Forbidden")
    void testCrearAdminRolUserRetorna403() throws Exception {
        mockMvc.perform(post("/api/admin/crear-admin")
                .with(user("usuario1").roles("USER"))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"nuevoAdmin\",\"email\":\"admin@test.com\",\"password\":\"Admin123!\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("POST /api/admin/entrenamientos-base con rol USER retorna 403 Forbidden")
    void testEntrenamientosBaseRolUserRetorna403() throws Exception {
        mockMvc.perform(post("/api/admin/entrenamientos-base")
                .with(user("usuario1").roles("USER"))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"nombre\":\"Fuerza\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("DELETE /api/admin/centros-privados-base/1 con rol USER retorna 403 Forbidden")
    void testCentrosPrivadosBaseRolUserRetorna403() throws Exception {
        mockMvc.perform(delete("/api/admin/centros-privados-base/1")
                .with(user("usuario1").roles("USER")))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("DELETE /api/admin/lugares-publicos-base/1 con rol USER retorna 403 Forbidden")
    void testLugaresPublicosBaseRolUserRetorna403() throws Exception {
        mockMvc.perform(delete("/api/admin/lugares-publicos-base/1")
                .with(user("usuario1").roles("USER")))
                .andExpect(status().isForbidden());
    }

    // --- 3. ACCESO CON ROL ADMIN (AUTORIZADO: 200/201/204) ---

    @Test
    @DisplayName("POST /api/admin/crear-admin con rol ADMIN es procesado exitosamente (201 Created)")
    void testCrearAdminRolAdminPermitido() throws Exception {
        mockMvc.perform(post("/api/admin/crear-admin")
                .with(user("admin1").roles("ADMIN"))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"nuevoAdmin\",\"email\":\"admin@test.com\",\"password\":\"Admin123!\"}"))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("POST /api/admin/entrenamientos-base con rol ADMIN es procesado exitosamente (201 Created)")
    void testEntrenamientosBaseRolAdminPermitido() throws Exception {
        when(entrenamientoBaseService.crearEntrenamientoBase(any()))
                .thenReturn(new EntrenamientoBaseDTO());

        mockMvc.perform(post("/api/admin/entrenamientos-base")
                .with(user("admin1").roles("ADMIN"))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"nombre\":\"Fuerza\"}"))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("DELETE /api/admin/centros-privados-base/1 con rol ADMIN es procesado exitosamente (204 No Content)")
    void testCentrosPrivadosBaseRolAdminPermitido() throws Exception {
        mockMvc.perform(delete("/api/admin/centros-privados-base/1")
                .with(user("admin1").roles("ADMIN")))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("DELETE /api/admin/lugares-publicos-base/1 con rol ADMIN es procesado exitosamente (204 No Content)")
    void testLugaresPublicosBaseRolAdminPermitido() throws Exception {
        mockMvc.perform(delete("/api/admin/lugares-publicos-base/1")
                .with(user("admin1").roles("ADMIN")))
                .andExpect(status().isNoContent());
    }
}
