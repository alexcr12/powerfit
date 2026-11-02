package com.powerfitgym.backend.servicio;

import com.powerfitgym.backend.entidad.Membresia;
import com.powerfitgym.backend.entidad.MembresiaProducto;
import com.powerfitgym.backend.entidad.Socio;
import com.powerfitgym.backend.repositorio.MembresiaRepository;
import com.powerfitgym.backend.repositorio.MembresiaProductoRepository;
import com.powerfitgym.backend.repositorio.SocioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class MembresiaService {

    private final MembresiaRepository membresiaRepository;
    private final SocioRepository socioRepository;
    private final MembresiaProductoRepository membresiaProductoRepository;

    public MembresiaService(MembresiaRepository membresiaRepository,
            SocioRepository socioRepository,
            MembresiaProductoRepository membresiaProductoRepository) {
        this.membresiaRepository = membresiaRepository;
        this.socioRepository = socioRepository;
        this.membresiaProductoRepository = membresiaProductoRepository;
    }

    public List<Membresia> listarTodas() {
        List<Membresia> membresias = membresiaRepository.findAll();
        return actualizarVencidas(membresias);
    }

    public List<Membresia> listarPorSocio(Long socioId) {
        List<Membresia> membresias = membresiaRepository.findBySocioId(socioId);
        return actualizarVencidas(membresias);
    }

    public List<Membresia> listarPorEstado(String estado) {
        return membresiaRepository.findByEstado(estado);
    }

    public Membresia buscarPorId(Long id) {
        return membresiaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Membresía no encontrada con ID: " + id));
    }

    public Membresia crear(Membresia membresia) {
        if (membresia.getSocio() == null || membresia.getSocio().getId() == null) {
            throw new IllegalArgumentException("El socio es obligatorio para registrar la membresía.");
        }

        Long socioId = membresia.getSocio().getId();
        Socio socioPersistente = socioRepository.findById(socioId)
                .orElseThrow(() -> new RuntimeException("Socio no encontrado con ID: " + socioId));

        List<Membresia> membresiasActivas = membresiaRepository.findBySocioId(socioId)
                .stream()
                .filter(m -> "activa".equalsIgnoreCase(m.getEstado())
                        && m.getFechaFin().isAfter(LocalDate.now().minusDays(1)))
                .toList();

        if (!membresiasActivas.isEmpty()) {
            throw new IllegalArgumentException(
                    "El socio ya cuenta con una membresía activa vigente. No se puede crear otra.");
        }

        membresia.setSocio(socioPersistente);
        return membresiaRepository.save(membresia);
    }

    public Membresia actualizar(Long id, Membresia datosActualizados) {
        Membresia membresia = buscarPorId(id);

        if (datosActualizados.getFechaInicio() != null) {
            membresia.setFechaInicio(datosActualizados.getFechaInicio());
        }
        if (datosActualizados.getFechaFin() != null) {
            membresia.setFechaFin(datosActualizados.getFechaFin());
        }
        if (datosActualizados.getMontoTotal() != null) {
            membresia.setMontoTotal(datosActualizados.getMontoTotal());
        }
        if (datosActualizados.getEstado() != null) {
            membresia.setEstado(datosActualizados.getEstado());
        }

        return membresiaRepository.save(membresia);
    }

    @Transactional
    public void eliminar(Long id) {
        Membresia membresia = membresiaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Membresía no encontrada con ID: " + id));

        List<MembresiaProducto> productosAsociados = membresiaProductoRepository.findByMembresiaId(id);
        if (productosAsociados != null && !productosAsociados.isEmpty()) {
            membresiaProductoRepository.deleteAll(productosAsociados);
        }

        membresiaRepository.delete(membresia);
    }

    private List<Membresia> actualizarVencidas(List<Membresia> membresias) {
        LocalDate hoy = LocalDate.now();
        boolean hayCambios = false;

        for (Membresia m : membresias) {
            if ("activa".equalsIgnoreCase(m.getEstado()) && m.getFechaFin().isBefore(hoy)) {
                m.setEstado("vencida");
                hayCambios = true;
            }
        }

        if (hayCambios) {
            return membresiaRepository.saveAll(membresias);
        }
        return membresias;
    }
}