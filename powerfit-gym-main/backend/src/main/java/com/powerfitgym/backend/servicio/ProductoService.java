package com.powerfitgym.backend.servicio;

import com.powerfitgym.backend.entidad.Categoria;
import com.powerfitgym.backend.entidad.Producto;
import com.powerfitgym.backend.excepcion.ReglaNegocioException;
import com.powerfitgym.backend.repositorio.CategoriaRepository;
import com.powerfitgym.backend.repositorio.ProductoRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
public class ProductoService {

    private final CategoriaRepository categoriaRepository;
    private final ProductoRepository productoRepository;

    public ProductoService(CategoriaRepository categoriaRepository, ProductoRepository productoRepository) {
        this.categoriaRepository = categoriaRepository;
        this.productoRepository = productoRepository;
    }

    public List<Producto> listarTodos() {
        return productoRepository.findAll();
    }

    public List<Producto> listarConFiltros(Long categoriaId, Boolean activo) {
        return productoRepository.buscarConFiltros(categoriaId, activo);
    }

    public Producto buscarPorId(Long id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + id));
    }

    public Producto crear(Producto producto) {
        if (producto.getNombre() == null || producto.getNombre().trim().isEmpty())
            throw new ReglaNegocioException("El nombre del producto es obligatorio.");
        producto.setNombre(producto.getNombre().trim());
        if (producto.getCategoria() != null && producto.getCategoria().getId() != null) {
            Categoria catReal = categoriaRepository.findById(producto.getCategoria().getId())
                    .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
            producto.setCategoria(catReal);
        }
        Producto guardado = productoRepository.save(producto);
        Long categoriaId = guardado.getCategoria() == null ? null : guardado.getCategoria().getId();
        log.info("Producto creado id={} nombre={} categoriaId={}", guardado.getId(), guardado.getNombre(), categoriaId);
        return guardado;
    }

    public Producto actualizar(Long id, Producto datos) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        if (datos.getNombre() != null) {
            if (datos.getNombre().trim().isEmpty())
                throw new ReglaNegocioException("El nombre del producto no puede estar vacío.");
            producto.setNombre(datos.getNombre().trim());
        }
        if (datos.getRequiereAsistencia() != null)
            producto.setRequiereAsistencia(datos.getRequiereAsistencia());
        boolean estabaActivo = Boolean.TRUE.equals(producto.getActivo());
        if (datos.getActivo() != null)
            producto.setActivo(datos.getActivo());

        if (datos.getCategoria() != null && datos.getCategoria().getId() != null) {
            Categoria catReal = categoriaRepository.findById(datos.getCategoria().getId())
                    .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
            producto.setCategoria(catReal);
        }

        Producto guardado = productoRepository.save(producto);
        if (datos.getActivo() != null && estabaActivo != datos.getActivo()) {
            log.info("Producto {} id={}", datos.getActivo() ? "reactivado" : "desactivado", guardado.getId());
        } else {
            log.info("Producto actualizado id={}", guardado.getId());
        }
        return guardado;
    }

    public void eliminar(Long id) {
        Producto producto = buscarPorId(id);
        producto.setActivo(false);
        Producto guardado = productoRepository.save(producto);
        log.info("Producto desactivado id={}", guardado.getId());
    }
}
