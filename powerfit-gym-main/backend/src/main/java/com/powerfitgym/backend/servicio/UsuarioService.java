package com.powerfitgym.backend.servicio;

import com.powerfitgym.backend.entidad.Usuario;
import com.powerfitgym.backend.repositorio.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
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
        if (usuarioRepository.existsByEmail(usuario.getEmail())) {
            throw new RuntimeException("El correo ya está registrado");
        }

        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        return usuarioRepository.save(usuario);
    }

    public Usuario actualizar(Long id, Usuario datosActualizados) {
        Usuario usuario = buscarPorId(id);

        if (datosActualizados.getNombre() != null)
            usuario.setNombre(datosActualizados.getNombre());

        if (datosActualizados.getEmail() != null)
            usuario.setEmail(datosActualizados.getEmail());

        if (datosActualizados.getPassword() != null && !datosActualizados.getPassword().isEmpty()) {
            usuario.setPassword(passwordEncoder.encode(datosActualizados.getPassword()));
        }

        if (datosActualizados.getRol() != null)
            usuario.setRol(datosActualizados.getRol());

        return usuarioRepository.save(usuario);
    }

    public void eliminar(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new RuntimeException("Usuario no encontrado con ID: " + id);
        }
        usuarioRepository.deleteById(id);
    }
}