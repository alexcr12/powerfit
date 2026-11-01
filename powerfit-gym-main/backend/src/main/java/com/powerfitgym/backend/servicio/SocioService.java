package com.powerfitgym.backend.servicio;

import com.powerfitgym.backend.entidad.Socio;
import com.powerfitgym.backend.repositorio.SocioRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class SocioService {

    private final SocioRepository socioRepository;

    public SocioService(SocioRepository socioRepository) {
        this.socioRepository = socioRepository;
    }

    public List<Socio> listarTodos() {
        return socioRepository.findAll();
    }

    public List<Socio> listarActivos() {
        return socioRepository.findByActivoTrue();
    }

    public Socio buscarPorId(Long id) {
        return socioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Socio no encontrado con ID: " + id));
    }

    public Socio buscarPorDocumento(String documento) {
        return socioRepository.findByDocumento(documento)
                .orElseThrow(() -> new RuntimeException("Socio no encontrado con documento: " + documento));
    }

    public Socio crear(Socio socio) {
        if (socioRepository.existsByDocumento(socio.getDocumento())) {
            throw new RuntimeException("Ya existe un socio con este documento");
        }
        if (socio.getFechaRegistro() == null) {
            socio.setFechaRegistro(LocalDate.now());
        }
        return socioRepository.save(socio);
    }

    public Socio actualizar(Long id, Socio datosActualizados) {
        Socio socio = buscarPorId(id);
        if (datosActualizados.getNombre() != null) socio.setNombre(datosActualizados.getNombre());
        if (datosActualizados.getDocumento() != null) socio.setDocumento(datosActualizados.getDocumento());
        if (datosActualizados.getTelefono() != null) socio.setTelefono(datosActualizados.getTelefono());
        if (datosActualizados.getActivo() != null) socio.setActivo(datosActualizados.getActivo());
        return socioRepository.save(socio);
    }

    public void eliminar(Long id) {
        socioRepository.deleteById(id);
    }
}