package com.powerfitgym.backend.servicio;

import com.powerfitgym.backend.entidad.*;
import com.powerfitgym.backend.repositorio.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.powerfitgym.backend.repositorio.UsuarioRepository;

import java.util.List;
import java.util.Map;

@Service
public class SocioService {

    private final SocioRepository socioRepository;
    private final AsistenciaRepository asistenciaRepository;
    private final MembresiaRepository membresiaRepository;
    private final PaseInvitadoRepository paseInvitadoRepository;
    private final UsuarioRepository usuarioRepository;

    public SocioService(SocioRepository socioRepository,
            AsistenciaRepository asistenciaRepository,
            MembresiaRepository membresiaRepository,
            PaseInvitadoRepository paseInvitadoRepository,
            UsuarioRepository usuarioRepository) {
        this.socioRepository = socioRepository;
        this.asistenciaRepository = asistenciaRepository;
        this.membresiaRepository = membresiaRepository;
        this.paseInvitadoRepository = paseInvitadoRepository;
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
        return socioRepository.save(socio);
    }

    public Socio actualizar(Long id, Socio datos) {
        Socio socio = buscarPorId(id);
        if (datos.getNombre() != null) socio.setNombre(datos.getNombre());
        if (datos.getDocumento() != null) socio.setDocumento(datos.getDocumento());
        if (datos.getTelefono() != null) socio.setTelefono(datos.getTelefono());
        if (datos.getActivo() != null) socio.setActivo(datos.getActivo());
        return socioRepository.save(socio);
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

    @Transactional
    public void eliminar(Long id) {
        List<Asistencia> asistencias = asistenciaRepository.findBySocioId(id);
        if (asistencias != null && !asistencias.isEmpty()) {
            asistenciaRepository.deleteAll(asistencias);
        }

        List<PaseInvitado> pases = paseInvitadoRepository.findBySocioId(id);
        if (pases != null && !pases.isEmpty()) {
            paseInvitadoRepository.deleteAll(pases);
        }

        List<Membresia> membresias = membresiaRepository.findBySocioId(id);
        if (membresias != null && !membresias.isEmpty()) {
            membresiaRepository.deleteAll(membresias);
        }

        socioRepository.deleteById(id);
    }
}
