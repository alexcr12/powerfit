package com.powerfitgym.backend.repositorio;

import com.powerfitgym.backend.entidad.Socio;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface SocioRepository extends JpaRepository<Socio, Long> {
    Optional<Socio> findByDocumento(String documento);

    boolean existsByDocumento(String documento);

    List<Socio> findByActivoTrue();
    List<Socio> findByActivo(Boolean activo);

    long countByFechaRegistroBetween(LocalDate inicio, LocalDate fin);

    long countByActivoTrue();

}
