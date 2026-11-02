package com.powerfitgym.backend.repositorio;

import com.powerfitgym.backend.entidad.Asistencia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface AsistenciaRepository extends JpaRepository<Asistencia, Long> {
   
    
    List<Asistencia> findBySocioId(Long socioId);

    
    List<Asistencia> findByFechaHoraBetween(LocalDateTime inicio, LocalDateTime fin);

   
    long countBySocioIdAndFechaHoraBetween(Long socioId, LocalDateTime inicio, LocalDateTime fin);
}