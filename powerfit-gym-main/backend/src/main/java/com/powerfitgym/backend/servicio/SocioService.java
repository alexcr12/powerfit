package com.powerfitgym.backend.servicio;

import com.powerfitgym.backend.entidad.*;
import com.powerfitgym.backend.repositorio.*;
import org.springframework.stereotype.Service;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.powerfitgym.backend.repositorio.UsuarioRepository;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class SocioService {

    private final SocioRepository socioRepository;
    private final UsuarioRepository usuarioRepository;

    public SocioService(SocioRepository socioRepository, UsuarioRepository usuarioRepository) {
        this.socioRepository = socioRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public List<Socio> listarTodos() {
        return socioRepository.findAll();
    }

    public Socio buscarPorId(Long id) {
        return socioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Socio no encontrado con ID: " + id));
    }

    public Socio crear(Socio socio) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()
                && authentication.getName() != null && !"anonymousUser".equals(authentication.getName())) {
            socio.setRegistradoPor(usuarioRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new IllegalArgumentException("Usuario autenticado no encontrado.")));
        } else if (socio.getRegistradoPor() != null && socio.getRegistradoPor().getId() != null) {
            Long usuarioId = socio.getRegistradoPor().getId();
            socio.setRegistradoPor(usuarioRepository.findById(usuarioId)
                    .orElseThrow(() -> new IllegalArgumentException("Usuario registrado_por no encontrado.")));
        } else {
            throw new IllegalArgumentException("El usuario registrado_por es obligatorio.");
        }
        Socio guardado = socioRepository.save(socio);
        log.info("Socio registrado id={} por usuarioId={}", guardado.getId(), guardado.getRegistradoPor().getId());
        return guardado;
    }

    public Socio actualizar(Long id, Socio datos) {
        Socio socio = buscarPorId(id);
        if (datos.getNombre() != null) socio.setNombre(datos.getNombre());
        if (datos.getDocumento() != null) socio.setDocumento(datos.getDocumento());
        if (datos.getTelefono() != null) socio.setTelefono(datos.getTelefono());
        boolean estabaActivo = Boolean.TRUE.equals(socio.getActivo());
        if (datos.getActivo() != null) socio.setActivo(datos.getActivo());
        Socio actualizado = socioRepository.save(socio);
        if (datos.getActivo() != null && estabaActivo != datos.getActivo()) {
            log.info("Socio {} id={}", datos.getActivo() ? "reactivado" : "desactivado", actualizado.getId());
        }
        return actualizado;
    }

    public Map<String, Object> obtenerMetricasSocios() {
        java.time.LocalDate hoy = java.time.LocalDate.now();
        
        long sociosHoy = socioRepository.countByFechaRegistroBetween(hoy, hoy);
        long totalSocios = socioRepository.count();
        long sociosActivos = socioRepository.countByActivoTrue(); 

        return Map.of(
            "sociosHoy", sociosHoy,
            "totalSocios", totalSocios,
            "sociosActivos", sociosActivos
        );
    }

    public void eliminar(Long id) {
        Socio socio = buscarPorId(id);
        socio.setActivo(false);
        socioRepository.save(socio);
        log.info("Socio desactivado id={}", socio.getId());
    }
}
