package com.powerfitgym.backend.servicio;

import com.powerfitgym.backend.entidad.Asistencia;
import com.powerfitgym.backend.entidad.Socio;
import com.powerfitgym.backend.entidad.Producto;
import com.powerfitgym.backend.repositorio.AsistenciaRepository;
import com.powerfitgym.backend.repositorio.SocioRepository;
import com.powerfitgym.backend.repositorio.ProductoRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AsistenciaService {

    private final AsistenciaRepository asistenciaRepository;
    private final SocioRepository socioRepository;
    private final ProductoRepository productoRepository;

    public AsistenciaService(AsistenciaRepository asistenciaRepository, SocioRepository socioRepository, ProductoRepository productoRepository) {
        this.asistenciaRepository = asistenciaRepository;
        this.socioRepository = socioRepository;
        this.productoRepository = productoRepository;
    }

    public List<Asistencia> listarTodas() {
        return asistenciaRepository.findAll();
    }

    public List<Asistencia> listarPorSocio(Long socioId) {
        return asistenciaRepository.findBySocioId(socioId);
    }

    public Asistencia registrar(Asistencia asistencia) {
        if (asistencia.getFechaHora() == null) {
            asistencia.setFechaHora(LocalDateTime.now());
        }
        if (asistencia.getProducto() == null || asistencia.getProducto().getId() == null) throw new IllegalArgumentException("El producto_id es obligatorio.");
        asistencia.setProducto(productoRepository.findById(asistencia.getProducto().getId()).orElseThrow(() -> new RuntimeException("Producto no encontrado")));
        return asistenciaRepository.save(asistencia);
    }

    public Asistencia buscarPorId(Long id) {
        return asistenciaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Asistencia no encontrada con ID: " + id));
    }

    public Asistencia actualizar(Long id, Asistencia datos) {
        Asistencia a = buscarPorId(id);

        if (datos.getFechaHora() != null)
            a.setFechaHora(datos.getFechaHora());
        if (datos.getProducto() != null && datos.getProducto().getId() != null)
            a.setProducto(productoRepository.findById(datos.getProducto().getId()).orElseThrow(() -> new RuntimeException("Producto no encontrado")));

        if (datos.getSocio() != null && datos.getSocio().getId() != null) {
            Socio socioReal = socioRepository.findById(datos.getSocio().getId())
                    .orElseThrow(() -> new RuntimeException("Socio no encontrado"));
            a.setSocio(socioReal);
        }

        return asistenciaRepository.save(a);
    }

    public void eliminar(Long id) {
        if (!asistenciaRepository.existsById(id)) {
            throw new RuntimeException("Asistencia no encontrada con ID: " + id);
        }
        asistenciaRepository.deleteById(id);
    }
}
