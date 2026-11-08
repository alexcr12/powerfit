package com.powerfitgym.backend.servicio;

import com.powerfitgym.backend.entidad.Categoria;
import com.powerfitgym.backend.entidad.Membresia;
import com.powerfitgym.backend.entidad.Socio;
import com.powerfitgym.backend.excepcion.ReglaNegocioException;
import com.powerfitgym.backend.repositorio.CategoriaRepository;
import com.powerfitgym.backend.repositorio.MembresiaRepository;
import com.powerfitgym.backend.repositorio.SocioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class MembresiaService {
    private final MembresiaRepository membresiaRepository;
    private final SocioRepository socioRepository;
    private final CategoriaRepository categoriaRepository;
    private final BigDecimal precioMembresia;

    public MembresiaService(MembresiaRepository membresiaRepository, SocioRepository socioRepository,
                            CategoriaRepository categoriaRepository,
                            @Value("${membresia.precio}") BigDecimal precioMembresia) {
        this.membresiaRepository = membresiaRepository;
        this.socioRepository = socioRepository;
        this.categoriaRepository = categoriaRepository;
        this.precioMembresia = precioMembresia;
    }

    public List<Membresia> listarConFiltros(Long socioId, Boolean activo, Boolean vigente) {
        return membresiaRepository.buscarConFiltros(socioId, activo, vigente, LocalDate.now());
    }

    public Membresia buscarPorId(Long id) {
        return membresiaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Membresía no encontrada con ID: " + id));
    }

    public Membresia crear(Membresia membresia) {
        if (membresia.getSocio() == null || membresia.getSocio().getId() == null)
            throw new IllegalArgumentException("El socio_id es obligatorio para registrar la membresía.");
        if (membresia.getCategoria() == null || membresia.getCategoria().getId() == null)
            throw new IllegalArgumentException("La categoria_id es obligatoria para registrar la membresía.");

        Socio socio = socioRepository.findById(membresia.getSocio().getId())
                .orElseThrow(() -> new RuntimeException("Socio no encontrado"));
        if (!Boolean.TRUE.equals(socio.getActivo()))
            throw new ReglaNegocioException("No se puede crear una membresía para un socio inactivo.");

        Categoria categoria = categoriaRepository.findById(membresia.getCategoria().getId())
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
        if (!Boolean.TRUE.equals(categoria.getActivo()))
            throw new ReglaNegocioException("El tipo de membresía " + categoria.getNombre() + " no está disponible para nuevas contrataciones");

        LocalDate hoy = LocalDate.now();
        if (membresiaRepository.existsBySocioIdAndCategoriaIdAndActivoTrueAndFechaFinGreaterThanEqual(
                socio.getId(), categoria.getId(), hoy))
            throw new ReglaNegocioException("El socio ya tiene una membresía vigente de tipo " + categoria.getNombre() + ".");

        LocalDate fechaInicio = membresia.getFechaInicio() == null ? hoy : membresia.getFechaInicio();
        membresia.setSocio(socio);
        membresia.setCategoria(categoria);
        membresia.setFechaInicio(fechaInicio);
        membresia.setFechaFin(fechaInicio.plusMonths(1));
        membresia.setMontoTotal(precioMembresia);
        membresia.setActivo(true);
        Membresia guardada = membresiaRepository.save(membresia);
        log.info("Membresía contratada id={} categoriaId={}", guardada.getId(), categoria.getId());
        return guardada;
    }

    public Membresia actualizar(Long id, Membresia datos) {
        Membresia membresia = buscarPorId(id);
        if (datos.getFechaInicio() != null) membresia.setFechaInicio(datos.getFechaInicio());
        if (datos.getFechaFin() != null) membresia.setFechaFin(datos.getFechaFin());
        if (datos.getMontoTotal() != null) membresia.setMontoTotal(datos.getMontoTotal());
        if (datos.getActivo() != null) membresia.setActivo(datos.getActivo());

        if (membresia.getFechaFin().isBefore(membresia.getFechaInicio()))
            throw new ReglaNegocioException("La fecha_fin debe ser igual o posterior a fecha_inicio.");
        if (datos.getMontoTotal() != null && datos.getMontoTotal().compareTo(BigDecimal.ZERO) <= 0)
            throw new ReglaNegocioException("El monto_total debe ser mayor que cero.");
        return membresiaRepository.save(membresia);
    }

    public void eliminar(Long id) {
        Membresia membresia = buscarPorId(id);
        membresia.setActivo(false);
        membresiaRepository.save(membresia);
    }
}
