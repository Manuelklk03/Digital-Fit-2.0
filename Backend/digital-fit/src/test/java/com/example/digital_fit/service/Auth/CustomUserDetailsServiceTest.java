package com.example.digital_fit.service.Auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import com.example.digital_fit.model.Auth.Usuario;
import com.example.digital_fit.model.Enums.Rol;
import com.example.digital_fit.repository.Auth.UsuarioRepository;

@ExtendWith(MockitoExtension.class)
class CustomUserDetailsServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private CustomUserDetailsService customUserDetailsService;

    @Test
    void testLoadUserByUsername_encuentraPorUsername() {
        Usuario usuario = Usuario.builder()
                .username("usuario_test")
                .email("test@digitalfit.com")
                .password("hash123")
                .rol(Rol.USER)
                .build();

        when(usuarioRepository.findByUsername("usuario_test")).thenReturn(Optional.of(usuario));

        UserDetails userDetails = customUserDetailsService.loadUserByUsername("usuario_test");

        assertNotNull(userDetails);
        assertEquals("usuario_test", userDetails.getUsername());
        assertEquals("hash123", userDetails.getPassword());
        assertTrue(userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_USER")));
    }

    @Test
    void testLoadUserByUsername_encuentraPorEmail() {
        Usuario usuario = Usuario.builder()
                .username("usuario_email")
                .email("login@digitalfit.com")
                .password("hash456")
                .rol(Rol.ADMIN)
                .build();

        when(usuarioRepository.findByUsername("login@digitalfit.com")).thenReturn(Optional.empty());
        when(usuarioRepository.findByEmail("login@digitalfit.com")).thenReturn(Optional.of(usuario));

        UserDetails userDetails = customUserDetailsService.loadUserByUsername("login@digitalfit.com");

        assertNotNull(userDetails);
        assertEquals("usuario_email", userDetails.getUsername());
        assertTrue(userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")));
    }

    @Test
    void testLoadUserByUsername_noEncontrado() {
        when(usuarioRepository.findByUsername("inexistente")).thenReturn(Optional.empty());
        when(usuarioRepository.findByEmail("inexistente")).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class,
                () -> customUserDetailsService.loadUserByUsername("inexistente"));
    }
}
