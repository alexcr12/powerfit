package com.powerfitgym.backend.servicio;

import com.powerfitgym.backend.entidad.Producto;
import com.powerfitgym.backend.repositorio.ProductoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;

    public ProductoService(ProductoRepository productoRepository) {
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
        return productoRepository.save(producto);
    }

    public Producto actualizar(Long id, Producto datosActualizados) {
        Producto producto = buscarPorId(id);
        if (datosActualizados.getNombre() != null) producto.setNombre(datosActualizados.getNombre());
        if (datosActualizados.getPrecioBase() != null) producto.setPrecioBase(datosActualizados.getPrecioBase());
        if (datosActualizados.getSede() != null) producto.setSede(datosActualizados.getSede());
        if (datosActualizados.getActivo() != null) producto.setActivo(datosActualizados.getActivo());
        if (datosActualizados.getCategoria() != null) producto.setCategoria(datosActualizados.getCategoria());
        return productoRepository.save(producto);
    }

    public void eliminar(Long id) {
        productoRepository.deleteById(id);
    }
}