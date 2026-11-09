package com.powerfitgym.backend.repositorio;

import com.powerfitgym.backend.entidad.Asistencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface AsistenciaRepository extends JpaRepository<Asistencia, Long> {

    List<Asistencia> findBySocioId(Long socioId);

    List<Asistencia> findByFechaHoraBetween(LocalDateTime inicio, LocalDateTime fin);

    long countBySocioIdAndFechaHoraBetween(Long socioId, LocalDateTime inicio, LocalDateTime fin);

    long countByProductoIdAndFechaHoraBetween(Long productoId, LocalDateTime inicio, LocalDateTime fin);

    long countByFechaHoraBetween(LocalDateTime inicio, LocalDateTime fin);

    @Query("select a.producto.id as productoId, count(a.id) as total from Asistencia a " +
            "where a.fechaHora between :inicio and :fin group by a.producto.id")
    List<Object[]> contarPorProductoAgrupado(@Param("inicio") LocalDateTime inicio,
                                             @Param("fin") LocalDateTime fin);

    @Query("select a.producto.id, a.producto.nombre, count(a.id) from Asistencia a " +
            "where a.fechaHora between :inicio and :fin group by a.producto.id, a.producto.nombre")
    List<Object[]> contarPorProductoYNombreAgrupado(@Param("inicio") LocalDateTime inicio,
                                                     @Param("fin") LocalDateTime fin);
}
