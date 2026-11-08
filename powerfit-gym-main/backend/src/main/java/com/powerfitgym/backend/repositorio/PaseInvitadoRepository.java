package com.powerfitgym.backend.repositorio;

import com.powerfitgym.backend.entidad.PaseInvitado;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.time.LocalDate;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PaseInvitadoRepository extends JpaRepository<PaseInvitado, Long> {
    @Query("select p from PaseInvitado p where " +
            "(:socioId is null or p.socio.id = :socioId) and " +
            "(:fecha is null or p.fechaUso = :fecha) and " +
            "(:activo is null or p.activo = :activo)")
    List<PaseInvitado> buscarConFiltros(@Param("socioId") Long socioId,
                                        @Param("fecha") LocalDate fecha,
                                        @Param("activo") Boolean activo);

    long countBySocioIdAndActivoTrueAndFechaUsoBetween(Long socioId, LocalDate desde, LocalDate hasta);

    long countBySocioIdAndActivoTrueAndFechaUsoBetweenAndIdNot(Long socioId, LocalDate desde, LocalDate hasta, Long id);
}
