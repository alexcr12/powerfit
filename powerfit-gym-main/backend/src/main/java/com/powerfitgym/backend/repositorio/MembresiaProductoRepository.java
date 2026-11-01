package com.powerfitgym.backend.repositorio;

import com.powerfitgym.backend.entidad.MembresiaProducto;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MembresiaProductoRepository extends JpaRepository<MembresiaProducto, Long> {
    List<MembresiaProducto> findByMembresiaId(Long membresiaId);
}