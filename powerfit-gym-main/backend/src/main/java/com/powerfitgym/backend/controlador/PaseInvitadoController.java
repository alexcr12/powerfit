package com.powerfitgym.backend.controlador;

import com.powerfitgym.backend.entidad.PaseInvitado;
import com.powerfitgym.backend.entidad.Socio;
import com.powerfitgym.backend.servicio.PaseInvitadoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/pases_invitado")
public class PaseInvitadoController {

    private final PaseInvitadoService paseService;

    public PaseInvitadoController(PaseInvitadoService paseService) {
        this.paseService = paseService;
    }

    @GetMapping
    public ResponseEntity<List<PaseInvitado>> listar(
            @RequestParam(required = false, name = "socio_id") Long socioId) {
        if (socioId != null) {
            return ResponseEntity.ok(paseService.listarPorSocio(socioId));
        }
        return ResponseEntity.ok(paseService.listarTodos());
    }

    @PostMapping
    public ResponseEntity<PaseInvitado> crear(@RequestBody Map<String, Object> body) {

        Object socioIdObj = body.get("socio_id") != null ? body.get("socio_id") : body.get("socioId");
        if (socioIdObj == null && body.get("socio") instanceof Map<?, ?> sm) {
            socioIdObj = sm.get("id");
        }

        if (socioIdObj == null) {
            throw new IllegalArgumentException("El socio_id es obligatorio para generar el pase.");
        }

        PaseInvitado pase = new PaseInvitado();

        Socio socioRef = new Socio();
        socioRef.setId(Long.valueOf(socioIdObj.toString()));
        pase.setSocio(socioRef);

        Object nombreInv = body.get("nombre_inv") != null ? body.get("nombre_inv") : body.get("nombreInv");
        pase.setNombreInv(nombreInv != null ? nombreInv.toString().trim() : "Invitado Anónimo");

        Object fechaUso = body.get("fecha_uso") != null ? body.get("fecha_uso") : body.get("fechaUso");
        if (fechaUso != null) {
            try {
                pase.setFechaUso(LocalDate.parse(fechaUso.toString()));
            } catch (Exception e) {
                pase.setFechaUso(LocalDate.now());
            }
        } else {
            pase.setFechaUso(LocalDate.now());
        }

        Object activoObj = body.get("activo");
        pase.setActivo(activoObj == null || Boolean.parseBoolean(activoObj.toString()));

        return new ResponseEntity<>(paseService.crear(pase), HttpStatus.CREATED);
    }
}
