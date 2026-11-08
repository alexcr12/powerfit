package com.powerfitgym.backend.servicio;

import com.powerfitgym.backend.entidad.Categoria;
import com.powerfitgym.backend.entidad.Membresia;
import com.powerfitgym.backend.entidad.Socio;
import com.powerfitgym.backend.repositorio.CategoriaRepository;
import com.powerfitgym.backend.repositorio.MembresiaRepository;
import com.powerfitgym.backend.repositorio.SocioRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class MembresiaService {
    private final MembresiaRepository membresiaRepository;
    private final SocioRepository socioRepository;
    private final CategoriaRepository categoriaRepository;

    public MembresiaService(MembresiaRepository membresiaRepository, SocioRepository socioRepository,
                            CategoriaRepository categoriaRepository) {
        this.membresiaRepository = membresiaRepository;
        this.socioRepository = socioRepository;
        this.categoriaRepository = categoriaRepository;
    }

    public List<Membresia> listarTodas() { return membresiaRepository.findAll(); }
    public List<Membresia> listarPorSocio(Long socioId) { return membresiaRepository.findBySocioId(socioId); }
    public List<Membresia> listarPorActivo(Boolean activo) { return membresiaRepository.findByActivo(activo); }
    public Membresia buscarPorId(Long id) {
        return membresiaRepository.findById(id).orElseThrow(() -> new RuntimeException("Membresía no encontrada con ID: " + id));
    }

    public Membresia crear(Membresia membresia) {
        if (membresia.getSocio() == null || membresia.getSocio().getId() == null)
            throw new IllegalArgumentException("El socio es obligatorio para registrar la membresía.");
        if (membresia.getCategoria() == null || membresia.getCategoria().getId() == null)
            throw new IllegalArgumentException("La categoría es obligatoria para registrar la membresía.");
        Socio socio = socioRepository.findById(membresia.getSocio().getId()).orElseThrow(() -> new RuntimeException("Socio no encontrado"));
        Categoria categoria = categoriaRepository.findById(membresia.getCategoria().getId()).orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
        membresia.setSocio(socio);
        membresia.setCategoria(categoria);
        if (membresia.getFechaInicio() == null) membresia.setFechaInicio(LocalDate.now());
        membresia.setFechaFin(membresia.getFechaInicio().plusMonths(1));
        return membresiaRepository.save(membresia);
    }

    public Membresia actualizar(Long id, Membresia datos) {
        Membresia m = buscarPorId(id);
        if (datos.getFechaInicio() != null) { m.setFechaInicio(datos.getFechaInicio()); m.setFechaFin(datos.getFechaInicio().plusMonths(1)); }
        if (datos.getMontoTotal() != null) m.setMontoTotal(datos.getMontoTotal());
        if (datos.getActivo() != null) m.setActivo(datos.getActivo());
        if (datos.getCategoria() != null && datos.getCategoria().getId() != null)
            m.setCategoria(categoriaRepository.findById(datos.getCategoria().getId()).orElseThrow(() -> new RuntimeException("Categoría no encontrada")));
        return membresiaRepository.save(m);
    }

    public void eliminar(Long id) { membresiaRepository.delete(buscarPorId(id)); }
}
