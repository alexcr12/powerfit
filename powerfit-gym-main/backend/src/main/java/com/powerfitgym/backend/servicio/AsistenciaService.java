package com.powerfitgym.backend.servicio;

import com.powerfitgym.backend.entidad.Asistencia;
import com.powerfitgym.backend.repositorio.AsistenciaRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AsistenciaService {

    private final AsistenciaRepository asistenciaRepository;

    public AsistenciaService(AsistenciaRepository asistenciaRepository) {
        this.asistenciaRepository = asistenciaRepository;
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
        return asistenciaRepository.save(asistencia);
    }
}