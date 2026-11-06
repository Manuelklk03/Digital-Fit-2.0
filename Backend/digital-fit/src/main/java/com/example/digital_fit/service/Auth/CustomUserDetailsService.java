package com.example.digital_fit.service.Auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.example.digital_fit.model.Auth.Usuario;
import com.example.digital_fit.repository.Auth.UsuarioRepository;
import com.example.digital_fit.util.LogSanitizer;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    private static final Logger log = LoggerFactory.getLogger(CustomUserDetailsService.class);

    @Override
    public UserDetails loadUserByUsername(String login) throws UsernameNotFoundException {

        log.info("Buscando usuario con login: {}", LogSanitizer.sanitize(login));

        Usuario usuario = usuarioRepository.findByUsername(login)
                .orElseGet(() -> usuarioRepository.findByEmail(login)
                        .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado")));

        log.info("Usuario encontrado: {}", LogSanitizer.sanitize(usuario.getUsername()));

        return User.withUsername(usuario.getUsername())
                .password(usuario.getPassword())
                .roles(usuario.getRol().name())
                .build();
    }
}
