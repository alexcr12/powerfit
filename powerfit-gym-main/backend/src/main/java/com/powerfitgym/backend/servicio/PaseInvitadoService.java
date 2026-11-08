package com.powerfitgym.backend.servicio;

import com.powerfitgym.backend.entidad.Membresia;
import com.powerfitgym.backend.entidad.PaseInvitado;
import com.powerfitgym.backend.entidad.Socio;
import com.powerfitgym.backend.excepcion.ReglaNegocioException;
import com.powerfitgym.backend.repositorio.MembresiaRepository;
import com.powerfitgym.backend.repositorio.PaseInvitadoRepository;
import com.powerfitgym.backend.repositorio.SocioRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class PaseInvitadoService {
    private final PaseInvitadoRepository paseRepository;
    private final SocioRepository socioRepository;
    private final MembresiaRepository membresiaRepository;

    public PaseInvitadoService(PaseInvitadoRepository paseRepository, SocioRepository socioRepository,
                               MembresiaRepository membresiaRepository) {
        this.paseRepository = paseRepository;
        this.socioRepository = socioRepository;
        this.membresiaRepository = membresiaRepository;
    }

    public List<PaseInvitado> listarConFiltros(Long socioId, LocalDate fecha, Boolean activo) {
        return paseRepository.buscarConFiltros(socioId, fecha, activo);
    }

    public PaseInvitado crear(PaseInvitado pase) {
        if (pase.getSocio() == null || pase.getSocio().getId() == null)
            throw new IllegalArgumentException("El socio_id es obligatorio para generar el pase.");
        if (pase.getNombreInv() == null || pase.getNombreInv().isBlank())
            throw new IllegalArgumentException("El nombre_inv es obligatorio.");

        LocalDate fechaUso = pase.getFechaUso() == null ? LocalDate.now() : pase.getFechaUso();
        Socio socio = validarYCalcular(pase.getSocio().getId(), fechaUso, null, true);
        pase.setSocio(socio);
        pase.setNombreInv(pase.getNombreInv().trim());
        pase.setFechaUso(fechaUso);
        pase.setActivo(true);
        PaseInvitado guardado = paseRepository.saveAndFlush(pase);
        log.info("Pase de invitado generado id={} fechaUso={}", guardado.getId(), guardado.getFechaUso());
        return guardado;
    }

    public PaseInvitado actualizar(Long id, String nombreInv, LocalDate fechaUso) {
        PaseInvitado pase = paseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pase no encontrado con ID: " + id));
        if (nombreInv != null) {
            if (nombreInv.isBlank()) throw new IllegalArgumentException("El nombre_inv no puede estar vacío.");
            pase.setNombreInv(nombreInv.trim());
        }
        if (fechaUso != null && !fechaUso.equals(pase.getFechaUso())) {
            validarYCalcular(pase.getSocio().getId(), fechaUso, pase.getId(), true);
            pase.setFechaUso(fechaUso);
        }
        return paseRepository.save(pase);
    }

    public void eliminar(Long id) {
        PaseInvitado pase = paseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pase no encontrado con ID: " + id));
        pase.setActivo(false);
        paseRepository.save(pase);
    }

    public Map<String, Object> disponibles(Long socioId, LocalDate fecha) {
        if (socioId == null) throw new IllegalArgumentException("El socio_id es obligatorio.");
        LocalDate fechaConsulta = fecha == null ? LocalDate.now() : fecha;
        validarYCalcular(socioId, fechaConsulta, null, false);
        return datosDisponibilidad(socioId, fechaConsulta, null);
    }

    private Socio validarYCalcular(Long socioId, LocalDate fecha, Long paseExcluir, boolean validarElegibilidad) {
        Socio socio = socioRepository.findById(socioId)
                .orElseThrow(() -> new RuntimeException("Socio no encontrado con ID: " + socioId));
        if (validarElegibilidad) {
            if (!Boolean.TRUE.equals(socio.getActivo()))
                throw new ReglaNegocioException("El socio está inactivo.");
            boolean membresiaVigente = membresiaRepository
                    .existsBySocioIdAndActivoTrueAndFechaInicioLessThanEqualAndFechaFinGreaterThanEqual(
                            socioId, fecha, fecha);
            if (!membresiaVigente)
                throw new ReglaNegocioException("El socio no tiene una membresía vigente para generar el pase");
        }

        Map<String, Object> disponibilidad = datosDisponibilidad(socioId, fecha, paseExcluir);
        if (validarElegibilidad && (long) disponibilidad.get("usados") >= (int) disponibilidad.get("tope"))
            throw new ReglaNegocioException("Límite de pases del mes alcanzado (" + disponibilidad.get("usados")
                    + " de " + disponibilidad.get("tope") + ")");
        return socio;
    }

    private Map<String, Object> datosDisponibilidad(Long socioId, LocalDate fecha, Long paseExcluir) {
        long membresias = membresiaRepository.countBySocioId(socioId);
        boolean primeraMembresia = membresias == 1;
        int tope = primeraMembresia ? 3 : 2;
        LocalDate inicioMes = fecha.withDayOfMonth(1);
        LocalDate finMes = fecha.withDayOfMonth(fecha.lengthOfMonth());
        long usados = paseExcluir == null
                ? paseRepository.countBySocioIdAndActivoTrueAndFechaUsoBetween(socioId, inicioMes, finMes)
                : paseRepository.countBySocioIdAndActivoTrueAndFechaUsoBetweenAndIdNot(socioId, inicioMes, finMes, paseExcluir);
        long restantes = Math.max(0, tope - usados);
        return Map.of("tope", tope, "usados", usados, "restantes", restantes,
                "primeraMembresia", primeraMembresia);
    }
}
