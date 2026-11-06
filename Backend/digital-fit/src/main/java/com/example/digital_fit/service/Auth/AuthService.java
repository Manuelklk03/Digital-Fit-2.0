package com.example.digital_fit.service.Auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.digital_fit.dto.Admin.CrearAdmin;
import com.example.digital_fit.dto.Auth.UsuarioDTO;
import com.example.digital_fit.dto.Auth.UsuarioSesionDTO;
import com.example.digital_fit.exception.EmailYaExisteException;
import com.example.digital_fit.exception.RecursoNoEncontradoException;
import com.example.digital_fit.exception.UsernameYaExiste;
import com.example.digital_fit.model.Auth.Usuario;
import com.example.digital_fit.model.Enums.Rol;
import com.example.digital_fit.repository.Auth.UsuarioRepository;
import com.example.digital_fit.util.LogSanitizer;

import jakarta.transaction.Transactional;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public void registrar(UsuarioDTO usuarioDTO) {

        log.info("Registrando usuario: {}", LogSanitizer.sanitize(usuarioDTO.getUsername()));

        if (usuarioRepository.findByUsername(usuarioDTO.getUsername()).isPresent()) {
            log.warn("Usuario no creado, username ya existente {}", LogSanitizer.sanitize(usuarioDTO.getUsername()));
            throw new UsernameYaExiste("Nombre de usuario ya existe");
        }

        if (usuarioRepository.findByEmail(usuarioDTO.getEmail()).isPresent()) {
            throw new EmailYaExisteException("Email ya existe");
        }

        Usuario usuario = Usuario.builder()
                .username(usuarioDTO.getUsername())
                .email(usuarioDTO.getEmail())
                .password(passwordEncoder.encode(usuarioDTO.getPassword()))
                .rol(Rol.USER)
                .build();

        usuarioRepository.save(usuario);

        log.info("Usuario registrado exitosamente {}", LogSanitizer.sanitize(usuario.getUsername()));
    }

    @Transactional
    public void registrarAdmin(CrearAdmin crearAdmin) {

        log.info("Creación de administrador {}", LogSanitizer.sanitize(crearAdmin.getUsername()));

        if (usuarioRepository.findByUsername(crearAdmin.getUsername()).isPresent()) {
            log.warn("Admin no creado, username ya existente {}", LogSanitizer.sanitize(crearAdmin.getUsername()));
            throw new UsernameYaExiste("Nombre de usuario ya existe");
        }

        if (usuarioRepository.findByEmail(crearAdmin.getEmail()).isPresent()) {
            throw new EmailYaExisteException("Email ya existe");
        }

        Usuario admin = new Usuario();
        admin.setUsername(crearAdmin.getUsername());
        admin.setPassword(passwordEncoder.encode(crearAdmin.getPassword()));
        admin.setEmail(crearAdmin.getEmail());
        admin.setRol(Rol.ADMIN);

        usuarioRepository.save(admin);

        log.info("Admin creado exitosamente {}", LogSanitizer.sanitize(admin.getUsername()));
    }

    public UsuarioSesionDTO obtenerSesion(String username) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RecursoNoEncontradoException("No se encuentra el usuario"));

        return new UsuarioSesionDTO(usuario.getUsername(), usuario.getEmail(), usuario.getRol());
    }
}