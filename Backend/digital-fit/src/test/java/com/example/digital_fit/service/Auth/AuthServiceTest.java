package com.example.digital_fit.service.Auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.digital_fit.dto.Admin.CrearAdmin;
import com.example.digital_fit.dto.Auth.UsuarioDTO;
import com.example.digital_fit.dto.Auth.UsuarioSesionDTO;
import com.example.digital_fit.exception.EmailYaExisteException;
import com.example.digital_fit.exception.RecursoNoEncontradoException;
import com.example.digital_fit.exception.UsernameYaExiste;
import com.example.digital_fit.model.Auth.Usuario;
import com.example.digital_fit.model.Enums.Rol;
import com.example.digital_fit.repository.Auth.UsuarioRepository;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    @Test
    void testRegistrarExitoso() {
        UsuarioDTO dto = new UsuarioDTO();
        dto.setUsername("atletanuevo");
        dto.setEmail("atleta@digitalfit.com");
        dto.setPassword("Secret123!");

        when(usuarioRepository.findByUsername("atletanuevo")).thenReturn(Optional.empty());
        when(usuarioRepository.findByEmail("atleta@digitalfit.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("Secret123!")).thenReturn("encodedHash");

        authService.registrar(dto);

        verify(usuarioRepository).save(any(Usuario.class));
    }

    @Test
    void testRegistrarUsernameYaExiste() {
        UsuarioDTO dto = new UsuarioDTO();
        dto.setUsername("existente");
        dto.setEmail("otro@digitalfit.com");
        dto.setPassword("Secret123!");

        when(usuarioRepository.findByUsername("existente")).thenReturn(Optional.of(new Usuario()));

        assertThrows(UsernameYaExiste.class, () -> authService.registrar(dto));
    }

    @Test
    void testRegistrarEmailYaExiste() {
        UsuarioDTO dto = new UsuarioDTO();
        dto.setUsername("nuevouser");
        dto.setEmail("duplicado@digitalfit.com");
        dto.setPassword("Secret123!");

        when(usuarioRepository.findByUsername("nuevouser")).thenReturn(Optional.empty());
        when(usuarioRepository.findByEmail("duplicado@digitalfit.com")).thenReturn(Optional.of(new Usuario()));

        assertThrows(EmailYaExisteException.class, () -> authService.registrar(dto));
    }

    @Test
    void testRegistrarAdminExitoso() {
        CrearAdmin adminDto = new CrearAdmin();
        adminDto.setUsername("nuevoAdmin");
        adminDto.setEmail("admin@digitalfit.com");
        adminDto.setPassword("AdminPass99!");

        when(usuarioRepository.findByUsername("nuevoAdmin")).thenReturn(Optional.empty());
        when(usuarioRepository.findByEmail("admin@digitalfit.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("AdminPass99!")).thenReturn("encodedHashAdmin");

        authService.registrarAdmin(adminDto);

        verify(usuarioRepository).save(any(Usuario.class));
    }

    @Test
    void testRegistrarAdminUsernameYaExiste() {
        CrearAdmin adminDto = new CrearAdmin();
        adminDto.setUsername("adminExistente");
        adminDto.setEmail("admin2@digitalfit.com");
        adminDto.setPassword("AdminPass99!");

        when(usuarioRepository.findByUsername("adminExistente")).thenReturn(Optional.of(new Usuario()));

        assertThrows(UsernameYaExiste.class, () -> authService.registrarAdmin(adminDto));
    }

    @Test
    void testRegistrarAdminEmailYaExiste() {
        CrearAdmin adminDto = new CrearAdmin();
        adminDto.setUsername("adminNuevo");
        adminDto.setEmail("adminRepetido@digitalfit.com");
        adminDto.setPassword("AdminPass99!");

        when(usuarioRepository.findByUsername("adminNuevo")).thenReturn(Optional.empty());
        when(usuarioRepository.findByEmail("adminRepetido@digitalfit.com")).thenReturn(Optional.of(new Usuario()));

        assertThrows(EmailYaExisteException.class, () -> authService.registrarAdmin(adminDto));
    }

    @Test
    void testObtenerSesionExitoso() {
        Usuario usuario = Usuario.builder()
                .username("carlos_fit")
                .email("carlos@digitalfit.com")
                .rol(Rol.USER)
                .build();

        when(usuarioRepository.findByUsername("carlos_fit")).thenReturn(Optional.of(usuario));

        UsuarioSesionDTO sesion = authService.obtenerSesion("carlos_fit");

        assertNotNull(sesion);
        assertEquals("carlos_fit", sesion.getUsername());
        assertEquals("carlos@digitalfit.com", sesion.getEmail());
        assertEquals(Rol.USER, sesion.getRol());
    }

    @Test
    void testObtenerSesionNoEncontrado() {
        when(usuarioRepository.findByUsername("fantasma")).thenReturn(Optional.empty());

        assertThrows(RecursoNoEncontradoException.class, () -> authService.obtenerSesion("fantasma"));
    }
}
