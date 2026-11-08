package com.powerfitgym.backend.servicio;

import com.powerfitgym.backend.entidad.Asistencia;
import com.powerfitgym.backend.entidad.Socio;
import com.powerfitgym.backend.entidad.Producto;
import com.powerfitgym.backend.repositorio.AsistenciaRepository;
import com.powerfitgym.backend.repositorio.SocioRepository;
import com.powerfitgym.backend.repositorio.ProductoRepository;
import com.powerfitgym.backend.repositorio.MembresiaRepository;
import com.powerfitgym.backend.entidad.Categoria;
import com.powerfitgym.backend.excepcion.ReglaNegocioException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

@Service
public class AsistenciaService {

    private final AsistenciaRepository asistenciaRepository;
    private final SocioRepository socioRepository;
    private final ProductoRepository productoRepository;
    private final MembresiaRepository membresiaRepository;

    public AsistenciaService(AsistenciaRepository asistenciaRepository, SocioRepository socioRepository, ProductoRepository productoRepository, MembresiaRepository membresiaRepository) {
        this.asistenciaRepository = asistenciaRepository;
        this.socioRepository = socioRepository;
        this.productoRepository = productoRepository;
        this.membresiaRepository = membresiaRepository;
    }

    public List<Asistencia> listarTodas() {
        return asistenciaRepository.findAll();
    }

    public List<Asistencia> listarPorSocio(Long socioId) {
        return asistenciaRepository.findBySocioId(socioId);
    }

    public long contarPorProductoYFecha(Long productoId, LocalDate fecha) {
        return asistenciaRepository.countByProductoIdAndFechaHoraBetween(productoId,
                fecha.atStartOfDay(), fecha.atTime(LocalTime.MAX));
    }

    public Producto buscarProducto(Long productoId) {
        return productoRepository.findById(productoId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
    }

    public List<Map<String, Object>> contarHoyPorClase(LocalDate fecha) {
        LocalDateTime inicio = fecha.atStartOfDay();
        LocalDateTime fin = fecha.atTime(LocalTime.MAX);
        Map<Long, Long> conteos = new HashMap<>();
        for (Object[] fila : asistenciaRepository.contarPorProductoAgrupado(inicio, fin))
            conteos.put((Long) fila[0], (Long) fila[1]);

        List<Map<String, Object>> resultado = new ArrayList<>();
        for (Producto producto : productoRepository.findByRequiereAsistenciaTrueAndActivoTrue()) {
            Map<String, Object> contador = new HashMap<>();
            contador.put("productoId", producto.getId());
            contador.put("producto", producto.getNombre());
            contador.put("total", conteos.getOrDefault(producto.getId(), 0L));
            resultado.add(contador);
        }
        return resultado;
    }

    @Transactional
    public Asistencia registrar(Asistencia asistencia) {
        if (asistencia.getFechaHora() == null) {
            asistencia.setFechaHora(LocalDateTime.now());
        }
        asistencia.setSocio(resolverSocio(asistencia.getSocio()));
        asistencia.setProducto(resolverProducto(asistencia.getProducto()));
        validarAcceso(asistencia.getSocio(), asistencia.getProducto(), asistencia.getFechaHora());
        return asistenciaRepository.save(asistencia);
    }

    public Asistencia buscarPorId(Long id) {
        return asistenciaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Asistencia no encontrada con ID: " + id));
    }

    @Transactional
    public Asistencia actualizar(Long id, Asistencia datos) {
        Asistencia a = buscarPorId(id);

        if (datos.getFechaHora() != null)
            a.setFechaHora(datos.getFechaHora());
        if (datos.getProducto() != null && datos.getProducto().getId() != null)
            a.setProducto(resolverProducto(datos.getProducto()));

        if (datos.getSocio() != null && datos.getSocio().getId() != null) {
            a.setSocio(resolverSocio(datos.getSocio()));
        }

        validarAcceso(a.getSocio(), a.getProducto(), a.getFechaHora());

        return asistenciaRepository.save(a);
    }

    private Socio resolverSocio(Socio referencia) {
        if (referencia == null || referencia.getId() == null) throw new IllegalArgumentException("El socio_id es obligatorio.");
        Socio socio = socioRepository.findById(referencia.getId())
                .orElseThrow(() -> new RuntimeException("Socio no encontrado"));
        if (!Boolean.TRUE.equals(socio.getActivo())) throw new ReglaNegocioException("El socio está inactivo.");
        return socio;
    }

    private Producto resolverProducto(Producto referencia) {
        if (referencia == null || referencia.getId() == null) throw new IllegalArgumentException("El producto_id es obligatorio.");
        Producto producto = productoRepository.findById(referencia.getId())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        if (!Boolean.TRUE.equals(producto.getActivo())) throw new ReglaNegocioException("El producto está inactivo.");
        if (!Boolean.TRUE.equals(producto.getRequiereAsistencia())) throw new ReglaNegocioException("El producto no requiere asistencia a una clase.");
        return producto;
    }

    private void validarAcceso(Socio socio, Producto producto, LocalDateTime fechaHora) {
        Categoria categoria = producto.getCategoria();
        LocalDate fecha = fechaHora.toLocalDate();
        boolean tieneMembresia = membresiaRepository
                .existsBySocioIdAndCategoriaIdAndActivoTrueAndFechaInicioLessThanEqualAndFechaFinGreaterThanEqual(
                        socio.getId(), categoria.getId(), fecha, fecha);
        if (!tieneMembresia) {
            throw new ReglaNegocioException("El socio no tiene una membresía vigente del tipo (" + categoria.getNombre()
                    + ") al que pertenece la clase " + producto.getNombre());
        }
    }

    public void eliminar(Long id) {
        if (!asistenciaRepository.existsById(id)) {
            throw new RuntimeException("Asistencia no encontrada con ID: " + id);
        }
        asistenciaRepository.deleteById(id);
    }
}
