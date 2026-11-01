package com.powerfitgym.backend.servicio;

import com.powerfitgym.backend.entidad.Membresia;
import com.powerfitgym.backend.repositorio.MembresiaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MembresiaService {

    private final MembresiaRepository membresiaRepository;

    public MembresiaService(MembresiaRepository membresiaRepository) {
        this.membresiaRepository = membresiaRepository;
    }

    public List<Membresia> listarTodas() {
        return membresiaRepository.findAll();
    }

    public List<Membresia> listarPorSocio(Long socioId) {
        return membresiaRepository.findBySocioId(socioId);
    }

    public List<Membresia> listarPorEstado(String estado) {
        return membresiaRepository.findByEstado(estado);
    }

    public Membresia buscarPorId(Long id) {
        return membresiaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Membresía no encontrada con ID: " + id));
    }

    public Membresia crear(Membresia membresia) {
        return membresiaRepository.save(membresia);
    }

    public Membresia actualizar(Long id, Membresia datosActualizados) {
        Membresia membresia = buscarPorId(id);
        if (datosActualizados.getFechaInicio() != null) membresia.setFechaInicio(datosActualizados.getFechaInicio());
        if (datosActualizados.getFechaFin() != null) membresia.setFechaFin(datosActualizados.getFechaFin());
        if (datosActualizados.getMontoTotal() != null) membresia.setMontoTotal(datosActualizados.getMontoTotal());
        if (datosActualizados.getEstado() != null) membresia.setEstado(datosActualizados.getEstado());
        return membresiaRepository.save(membresia);
    }

    public void eliminar(Long id) {
        membresiaRepository.deleteById(id);
    }
}