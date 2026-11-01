package com.powerfitgym.backend.servicio;

import com.powerfitgym.backend.entidad.MembresiaProducto;
import com.powerfitgym.backend.repositorio.MembresiaProductoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MembresiaProductoService {

    private final MembresiaProductoRepository membresiaProductoRepository;

    public MembresiaProductoService(MembresiaProductoRepository membresiaProductoRepository) {
        this.membresiaProductoRepository = membresiaProductoRepository;
    }

    public List<MembresiaProducto> listarPorMembresia(Long membresiaId) {
        return membresiaProductoRepository.findByMembresiaId(membresiaId);
    }

    public MembresiaProducto crear(MembresiaProducto detalle) {
        return membresiaProductoRepository.save(detalle);
    }

    public void eliminar(Long id) {
        membresiaProductoRepository.deleteById(id);
    }
}