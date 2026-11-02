package com.powerfitgym.backend.repositorio;

import com.powerfitgym.backend.entidad.PaseInvitado;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PaseInvitadoRepository extends JpaRepository<PaseInvitado, Long> {
        List<PaseInvitado> findBySocioId(Long socioId);
}