package com.powerfitgym.backend.servicio;

import com.powerfitgym.backend.entidad.Usuario;
import com.powerfitgym.backend.excepcion.ReglaNegocioException;
import com.powerfitgym.backend.repositorio.UsuarioRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    public Usuario buscarPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + id));
    }

    public Usuario crear(Usuario usuario) {
        validarRol(usuario.getRol());
        if (usuarioRepository.existsByEmail(usuario.getEmail())) {
            throw new RuntimeException("El correo ya está registrado");
        }

        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        Usuario creado = usuarioRepository.save(usuario);
        log.info("Usuario creado email={} rol={}", creado.getEmail(), creado.getRol());
        return creado;
    }

    public Usuario actualizar(Long id, Usuario datosActualizados) {
        Usuario usuario = buscarPorId(id);
        if (datosActualizados.getRol() != null) validarRol(datosActualizados.getRol());

        if (datosActualizados.getNombre() != null)
            usuario.setNombre(datosActualizados.getNombre());

        if (datosActualizados.getEmail() != null)
            usuario.setEmail(datosActualizados.getEmail());

        if (datosActualizados.getPassword() != null && !datosActualizados.getPassword().isEmpty()) {
            usuario.setPassword(passwordEncoder.encode(datosActualizados.getPassword()));
        }

        if (datosActualizados.getRol() != null)
            usuario.setRol(datosActualizados.getRol());

        if (datosActualizados.getActivo() != null) {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            boolean esPropioUsuario = authentication != null && authentication.isAuthenticated()
                    && authentication.getName() != null
                    && authentication.getName().equalsIgnoreCase(usuario.getEmail());
            if (esPropioUsuario && !datosActualizados.getActivo()) {
                throw new ReglaNegocioException("No puedes desactivar tu propia cuenta.");
            }

            boolean estabaActivo = Boolean.TRUE.equals(usuario.getActivo());
            usuario.setActivo(datosActualizados.getActivo());
            if (estabaActivo != datosActualizados.getActivo()) {
                log.info("Usuario {} email={}", datosActualizados.getActivo() ? "reactivado" : "desactivado", usuario.getEmail());
            }
        }

        Usuario actualizado = usuarioRepository.save(usuario);
        log.info("Usuario actualizado email={}", actualizado.getEmail());
        return actualizado;
    }

    public void eliminar(Long id) {
        Usuario usuario = buscarPorId(id);
        boolean estabaActivo = Boolean.TRUE.equals(usuario.getActivo());
        usuario.setActivo(false);
        usuarioRepository.save(usuario);
        if (estabaActivo) log.info("Usuario desactivado email={}", usuario.getEmail());
    }

    private void validarRol(String rol) {
        if (!"admin".equals(rol) && !"staff".equals(rol))
            throw new IllegalArgumentException("El rol debe ser admin o staff");
    }
}
