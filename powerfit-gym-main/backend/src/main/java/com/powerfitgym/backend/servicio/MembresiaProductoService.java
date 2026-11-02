package com.powerfitgym.backend.servicio;

import com.powerfitgym.backend.entidad.Membresia;
import com.powerfitgym.backend.entidad.MembresiaProducto;
import com.powerfitgym.backend.entidad.Producto;
import com.powerfitgym.backend.repositorio.MembresiaProductoRepository;
import com.powerfitgym.backend.repositorio.MembresiaRepository;
import com.powerfitgym.backend.repositorio.ProductoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MembresiaProductoService {

    private final MembresiaProductoRepository membresiaProductoRepository;
    private final MembresiaRepository membresiaRepository;
    private final ProductoRepository productoRepository;

    public MembresiaProductoService(
            MembresiaProductoRepository membresiaProductoRepository,
            MembresiaRepository membresiaRepository,
            ProductoRepository productoRepository) {
        this.membresiaProductoRepository = membresiaProductoRepository;
        this.membresiaRepository = membresiaRepository;
        this.productoRepository = productoRepository;
    }

    public List<MembresiaProducto> listarTodos() {
        return membresiaProductoRepository.findAll();
    }

    public List<MembresiaProducto> listarPorMembresia(Long membresiaId) {
        return membresiaProductoRepository.findByMembresiaId(membresiaId);
    }

    public MembresiaProducto buscarPorId(Long id) {
        return membresiaProductoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("MembresiaProducto no encontrado con ID: " + id));
    }

    public MembresiaProducto crear(MembresiaProducto mp) {
        // Validaciones básicas
        if (mp.getMembresia() == null || mp.getMembresia().getId() == null) {
            throw new IllegalArgumentException("La membresía es obligatoria para registrar el producto.");
        }
        if (mp.getProducto() == null || mp.getProducto().getId() == null) {
            throw new IllegalArgumentException("El producto es obligatorio para registrar la membresía.");
        }

        Long membresiaId = mp.getMembresia().getId();
        Long productoId = mp.getProducto().getId();

        // Cargar entidades reales desde BD (evita el error de FK null)
        Membresia membresiaReal = membresiaRepository.findById(membresiaId)
                .orElseThrow(() -> new RuntimeException("Membresía no encontrada con ID: " + membresiaId));

        Producto productoReal = productoRepository.findById(productoId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + productoId));

        mp.setMembresia(membresiaReal);
        mp.setProducto(productoReal);

        // Valores por defecto si vienen null
        if (mp.getCantidadDisponible() == null) {
            mp.setCantidadDisponible(1);
        }
        if (mp.getPrecioUnitario() == null) {
            mp.setPrecioUnitario(productoReal.getPrecioBase() != null
                    ? productoReal.getPrecioBase()
                    : java.math.BigDecimal.ZERO);
        }

        return membresiaProductoRepository.save(mp);
    }

    public MembresiaProducto actualizar(Long id, MembresiaProducto datos) {
        MembresiaProducto mp = buscarPorId(id);

        if (datos.getPrecioUnitario() != null) {
            mp.setPrecioUnitario(datos.getPrecioUnitario());
        }
        if (datos.getCantidadDisponible() != null) {
            mp.setCantidadDisponible(datos.getCantidadDisponible());
        }
        if (datos.getProducto() != null && datos.getProducto().getId() != null) {
            Producto productoReal = productoRepository.findById(datos.getProducto().getId())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
            mp.setProducto(productoReal);
        }

        return membresiaProductoRepository.save(mp);
    }

    public void eliminar(Long id) {
        if (!membresiaProductoRepository.existsById(id)) {
            throw new RuntimeException("MembresiaProducto no encontrado con ID: " + id);
        }
        membresiaProductoRepository.deleteById(id);
    }
}