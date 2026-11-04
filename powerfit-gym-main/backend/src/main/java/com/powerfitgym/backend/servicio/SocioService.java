package com.powerfitgym.backend.servicio;

import com.powerfitgym.backend.entidad.*;
import com.powerfitgym.backend.repositorio.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class SocioService {

    private final SocioRepository socioRepository;
    private final AsistenciaRepository asistenciaRepository;
    private final MembresiaRepository membresiaRepository;
    private final MembresiaProductoRepository membresiaProductoRepository;
    private final PaseInvitadoRepository paseInvitadoRepository;

    public SocioService(SocioRepository socioRepository,
            AsistenciaRepository asistenciaRepository,
            MembresiaRepository membresiaRepository,
            MembresiaProductoRepository membresiaProductoRepository,
            PaseInvitadoRepository paseInvitadoRepository) {
        this.socioRepository = socioRepository;
        this.asistenciaRepository = asistenciaRepository;
        this.membresiaRepository = membresiaRepository;
        this.membresiaProductoRepository = membresiaProductoRepository;
        this.paseInvitadoRepository = paseInvitadoRepository;
    }

    public List<Socio> listarTodos() {
        return socioRepository.findAll();
    }

    public Socio buscarPorId(Long id) {
        return socioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Socio no encontrado con ID: " + id));
    }

    public Socio crear(Socio socio) {
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
            for (Membresia m : membresias) {
                List<MembresiaProducto> productos = membresiaProductoRepository.findByMembresiaId(m.getId());
                if (productos != null && !productos.isEmpty()) {
                    membresiaProductoRepository.deleteAll(productos);
                }
            }
            membresiaRepository.deleteAll(membresias);
        }

        socioRepository.deleteById(id);
    }
}