package com.powerfitgym.backend.servicio;

import com.powerfitgym.backend.entidad.Categoria;
import com.powerfitgym.backend.excepcion.ReglaNegocioException;
import com.powerfitgym.backend.repositorio.CategoriaRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    public CategoriaService(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    public List<Categoria> listarTodas() {
        return categoriaRepository.findAll();
    }

    public List<Categoria> listarPorActivo(Boolean activo) {
        return activo == null ? categoriaRepository.findAll() : categoriaRepository.findByActivo(activo);
    }

    public Categoria buscarPorId(Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada con ID: " + id));
    }

    public Categoria crear(Categoria categoria) {
        if (categoria.getNombre() == null || categoria.getNombre().trim().isEmpty())
            throw new ReglaNegocioException("El nombre de la categoría es obligatorio.");
        categoria.setNombre(categoria.getNombre().trim());
        Categoria guardada = categoriaRepository.save(categoria);
        log.info("Categoría creada id={} nombre={}", guardada.getId(), guardada.getNombre());
        return guardada;
    }

    public Categoria actualizar(Long id, Categoria datosActualizados) {
        Categoria categoria = buscarPorId(id);

        if (datosActualizados.getNombre() != null) {
            if (datosActualizados.getNombre().trim().isEmpty())
                throw new ReglaNegocioException("El nombre de la categoría no puede estar vacío.");
            categoria.setNombre(datosActualizados.getNombre().trim());
        }

        boolean estabaActiva = Boolean.TRUE.equals(categoria.getActivo());
        if (datosActualizados.getActivo() != null)
            categoria.setActivo(datosActualizados.getActivo());

        Categoria guardada = categoriaRepository.save(categoria);
        if (datosActualizados.getActivo() != null && estabaActiva != datosActualizados.getActivo()) {
            log.info("Categoría {} id={}", datosActualizados.getActivo() ? "reactivada" : "desactivada", guardada.getId());
        } else {
            log.info("Categoría actualizada id={}", guardada.getId());
        }
        return guardada;
    }

    public void eliminar(Long id) {
        Categoria categoria = buscarPorId(id);
        categoria.setActivo(false);
        Categoria guardada = categoriaRepository.save(categoria);
        log.info("Categoría desactivada id={}", guardada.getId());
    }
}
