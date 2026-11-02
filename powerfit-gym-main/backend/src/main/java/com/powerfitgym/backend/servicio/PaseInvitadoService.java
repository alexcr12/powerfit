package com.powerfitgym.backend.servicio;

import com.powerfitgym.backend.entidad.PaseInvitado;
import com.powerfitgym.backend.entidad.Socio;
import com.powerfitgym.backend.repositorio.PaseInvitadoRepository;
import com.powerfitgym.backend.repositorio.SocioRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PaseInvitadoService {

    private final PaseInvitadoRepository paseRepository;
    private final SocioRepository socioRepository;

    public PaseInvitadoService(PaseInvitadoRepository paseRepository, SocioRepository socioRepository) {
        this.paseRepository = paseRepository;
        this.socioRepository = socioRepository;
    }

    public List<PaseInvitado> listarTodos() {
        return paseRepository.findAll();
    }

    public List<PaseInvitado> listarPorSocio(Long socioId) {
        return paseRepository.findBySocioId(socioId);
    }

    @org.springframework.transaction.annotation.Transactional
    public PaseInvitado crear(PaseInvitado pase) {
        if (pase.getSocio() == null || pase.getSocio().getId() == null) {
            throw new IllegalArgumentException("El socio es obligatorio.");
        }

        Long socioId = pase.getSocio().getId();
        Socio socioReal = socioRepository.findById(socioId)
                .orElseThrow(() -> new RuntimeException("Socio no encontrado con ID: " + socioId));

        pase.setSocio(socioReal);
        if (pase.getActivo() == null) {
            pase.setActivo(true);
        }

        try {

            PaseInvitado guardado = paseRepository.saveAndFlush(pase);
            System.out.println("✅ PASE GUARDADO EN BD CON ID: " + guardado.getId());
            return guardado;
        } catch (Exception e) {

            System.out.println("❌ ERROR AL GUARDAR PASE: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}