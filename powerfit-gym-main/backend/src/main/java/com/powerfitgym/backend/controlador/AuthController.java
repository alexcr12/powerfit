package com.powerfitgym.backend.controlador;

import com.powerfitgym.backend.config.JwtService;
import com.powerfitgym.backend.entidad.Usuario;
import com.powerfitgym.backend.repositorio.UsuarioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@Slf4j
public class AuthController {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(JwtService jwtService, UserDetailsService userDetailsService,
            UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        Usuario usuario = usuarioRepository.findByEmail(email).orElse(null);

        if (usuario == null || !Boolean.TRUE.equals(usuario.getActivo())) {
            log.warn("Login fallido email={} motivo=usuario_no_disponible", email);
            return ResponseEntity.status(401).body(Map.of("mensaje", "Credenciales incorrectas"));
        }

        if (!passwordEncoder.matches(password, usuario.getPassword())) {
            log.warn("Login fallido email={} motivo=clave_incorrecta", email);
            return ResponseEntity.status(401).body(Map.of("mensaje", "Credenciales incorrectas"));
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        String jwt = jwtService.generarToken(userDetails);
        log.info("Login exitoso email={}", email);

        return ResponseEntity.ok(Map.of(
                "token", jwt,
                "nombre", usuario.getNombre(),
                "rol", usuario.getRol()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Usuario usuario) {
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        usuarioRepository.save(usuario);
        return ResponseEntity.ok("Usuario registrado");
    }
}
