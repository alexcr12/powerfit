package com.powerfitgym.backend.repositorio;

import com.powerfitgym.backend.entidad.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
    List<Producto> findByRequiereAsistenciaTrueAndActivoTrue();
    List<Producto> findByRequiereAsistenciaTrue();
    @Query("select p from Producto p where (:categoriaId is null or p.categoria.id = :categoriaId) and (:activo is null or p.activo = :activo)")
    List<Producto> buscarConFiltros(@Param("categoriaId") Long categoriaId, @Param("activo") Boolean activo);
}
