package com.powerfitgym.backend.servicio;

import com.powerfitgym.backend.entidad.Categoria;
import com.powerfitgym.backend.entidad.Producto;
import com.powerfitgym.backend.repositorio.AsistenciaRepository;
import com.powerfitgym.backend.repositorio.CategoriaRepository;
import com.powerfitgym.backend.repositorio.MembresiaRepository;
import com.powerfitgym.backend.repositorio.ProductoRepository;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class MetricasService {
    private final MembresiaRepository membresiaRepository;
    private final AsistenciaRepository asistenciaRepository;
    private final CategoriaRepository categoriaRepository;
    private final ProductoRepository productoRepository;
    private final MeterRegistry meterRegistry;

    public MetricasService(MembresiaRepository membresiaRepository, AsistenciaRepository asistenciaRepository,
                          CategoriaRepository categoriaRepository, ProductoRepository productoRepository,
                          MeterRegistry meterRegistry) {
        this.membresiaRepository = membresiaRepository;
        this.asistenciaRepository = asistenciaRepository;
        this.categoriaRepository = categoriaRepository;
        this.productoRepository = productoRepository;
        this.meterRegistry = meterRegistry;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void registrarGauges() {
        for (Categoria categoria : categoriaRepository.findAll()) {
            Gauge.builder("powerfit.membresias.vigentes",
                            () -> membresiaRepository.countByCategoriaNombreAndActivoTrueAndFechaInicioLessThanEqualAndFechaFinGreaterThanEqual(
                                    categoria.getNombre(), LocalDate.now(), LocalDate.now()))
                    .tag("categoria", categoria.getNombre())
                    .register(meterRegistry);
        }
        for (Producto producto : productoRepository.findByRequiereAsistenciaTrue()) {
            Gauge.builder("powerfit.asistencias.hoy",
                            () -> asistenciaRepository.countByProductoIdAndFechaHoraBetween(
                                    producto.getId(), LocalDate.now().atStartOfDay(), LocalDate.now().atTime(LocalTime.MAX)))
                    .tag("producto", producto.getNombre())
                    .register(meterRegistry);
        }
    }

    public Map<String, Object> obtenerMetricas() {
        LocalDate hoy = LocalDate.now();
        LocalDateTime inicio = hoy.atStartOfDay();
        LocalDateTime fin = hoy.atTime(LocalTime.MAX);

        Map<String, Long> membresiasPorCategoria = new HashMap<>();
        for (Object[] fila : membresiaRepository.contarVigentesPorCategoria(hoy))
            membresiasPorCategoria.put((String) fila[0], ((Number) fila[1]).longValue());

        List<Map<String, Object>> membresias = new ArrayList<>();
        for (Categoria categoria : categoriaRepository.findAll()) {
            membresias.add(Map.of("categoria", categoria.getNombre(),
                    "total", membresiasPorCategoria.getOrDefault(categoria.getNombre(), 0L)));
        }

        Map<Long, Long> asistenciasPorProductoId = new HashMap<>();
        for (Object[] fila : asistenciaRepository.contarPorProductoYNombreAgrupado(inicio, fin)) {
            Long productoId = ((Number) fila[0]).longValue();
            asistenciasPorProductoId.put(productoId, ((Number) fila[2]).longValue());
        }

        List<Map<String, Object>> porClase = new ArrayList<>();
        long totalAsistencias = asistenciaRepository.countByFechaHoraBetween(inicio, fin);
        for (Producto producto : productoRepository.findByRequiereAsistenciaTrue()) {
            long total = asistenciasPorProductoId.getOrDefault(producto.getId(), 0L);
            porClase.add(Map.of("producto", producto.getNombre(), "total", total));
        }

        return Map.of("membresiasVigentesPorTipo", membresias,
                "asistenciasHoy", Map.of("total", totalAsistencias, "porClase", porClase),
                "generadoEn", LocalDateTime.now().toString());
    }
}
