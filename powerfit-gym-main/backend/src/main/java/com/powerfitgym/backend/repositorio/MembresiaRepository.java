package com.powerfitgym.backend.repositorio;

import com.powerfitgym.backend.entidad.Membresia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.time.LocalDate;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MembresiaRepository extends JpaRepository<Membresia, Long> {
    List<Membresia> findBySocioId(Long socioId);

    List<Membresia> findByActivo(Boolean activo);

    boolean existsBySocioIdAndCategoriaIdAndActivoTrueAndFechaInicioLessThanEqualAndFechaFinGreaterThanEqual(
            Long socioId, Long categoriaId, LocalDate fechaInicio, LocalDate fechaFin);

    boolean existsBySocioIdAndCategoriaIdAndActivoTrueAndFechaFinGreaterThanEqual(
            Long socioId, Long categoriaId, LocalDate hoy);

    @Query("select m from Membresia m where " +
            "(:socioId is null or m.socio.id = :socioId) and " +
            "(:activo is null or m.activo = :activo) and " +
            "(:vigente is null or " +
            "(:vigente = true and m.activo = true and m.fechaFin >= :hoy) or " +
            "(:vigente = false and (m.activo = false or m.fechaFin < :hoy)))")
    List<Membresia> buscarConFiltros(@Param("socioId") Long socioId,
                                     @Param("activo") Boolean activo,
                                     @Param("vigente") Boolean vigente,
                                     @Param("hoy") LocalDate hoy);
}
