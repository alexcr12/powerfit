package com.powerfitgym.backend.repositorio;

import com.powerfitgym.backend.entidad.Membresia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.time.LocalDate;

public interface MembresiaRepository extends JpaRepository<Membresia, Long> {
    List<Membresia> findBySocioId(Long socioId);

    List<Membresia> findByActivo(Boolean activo);

    boolean existsBySocioIdAndCategoriaIdAndActivoTrueAndFechaInicioLessThanEqualAndFechaFinGreaterThanEqual(
            Long socioId, Long categoriaId, LocalDate fechaInicio, LocalDate fechaFin);
}
