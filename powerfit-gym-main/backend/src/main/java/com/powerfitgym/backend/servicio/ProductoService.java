package com.powerfitgym.backend.servicio;

import com.powerfitgym.backend.entidad.Categoria;
import com.powerfitgym.backend.entidad.Producto;
import com.powerfitgym.backend.repositorio.CategoriaRepository;
import com.powerfitgym.backend.repositorio.ProductoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
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

    public List<Producto> listarActivos() {
        return productoRepository.findByActivoTrue();
    }

    public List<Producto> listarPorCategoria(Long categoriaId) {
        return productoRepository.findByCategoriaId(categoriaId);
    }

    public Producto buscarPorId(Long id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + id));
    }

    public Producto crear(Producto producto) {
        if (producto.getCategoria() != null && producto.getCategoria().getId() != null) {
            Categoria catReal = categoriaRepository.findById(producto.getCategoria().getId())
                    .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
            producto.setCategoria(catReal);
        }
        return productoRepository.save(producto);
    }

    public Producto actualizar(Long id, Producto datos) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        if (datos.getNombre() != null)
            producto.setNombre(datos.getNombre());
        if (datos.getRequiereAsistencia() != null)
            producto.setRequiereAsistencia(datos.getRequiereAsistencia());
        if (datos.getActivo() != null)
            producto.setActivo(datos.getActivo());

        if (datos.getCategoria() != null && datos.getCategoria().getId() != null) {
            Categoria catReal = categoriaRepository.findById(datos.getCategoria().getId())
                    .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
            producto.setCategoria(catReal);
        }

        return productoRepository.save(producto);
    }

    public void eliminar(Long id) {
        productoRepository.deleteById(id);
    }
}
