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
            @RequestParam(required = false, name = "socio_id") Long socioId,
            @RequestParam(required = false) LocalDate fecha,
            @RequestParam(required = false) Boolean activo) {
        return ResponseEntity.ok(paseService.listarConFiltros(socioId, fecha, activo));
    }

    @GetMapping("/disponibles")
    public ResponseEntity<Map<String, Object>> disponibles(
            @RequestParam(required = false, name = "socio_id") Long socioId,
            @RequestParam(required = false) LocalDate fecha) {
        return ResponseEntity.ok(paseService.disponibles(socioId, fecha));
    }

    @PostMapping
    public ResponseEntity<PaseInvitado> crear(@RequestBody Map<String, Object> body) {
        Object socioIdObj = body.get("socio_id") != null ? body.get("socio_id") : body.get("socioId");
        if (socioIdObj == null && body.get("socio") instanceof Map<?, ?> socioMap)
            socioIdObj = socioMap.get("id");
        Long socioId = convertirALong(socioIdObj);
        if (socioId == null) throw new IllegalArgumentException("El socio_id es obligatorio para generar el pase.");

        Object nombre = body.get("nombre_inv") != null ? body.get("nombre_inv") : body.get("nombreInv");
        if (nombre == null || nombre.toString().isBlank())
            throw new IllegalArgumentException("El nombre_inv es obligatorio.");

        Object fecha = body.get("fecha_uso") != null ? body.get("fecha_uso") : body.get("fechaUso");
        PaseInvitado pase = new PaseInvitado();
        Socio socio = new Socio();
        socio.setId(socioId);
        pase.setSocio(socio);
        pase.setNombreInv(nombre.toString().trim());
        pase.setFechaUso(fecha == null ? LocalDate.now() : parseFecha(fecha));
        return new ResponseEntity<>(paseService.crear(pase), HttpStatus.CREATED);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<PaseInvitado> actualizar(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Object nombre = body.containsKey("nombre_inv") ? body.get("nombre_inv") : body.get("nombreInv");
        Object fecha = body.containsKey("fecha_uso") ? body.get("fecha_uso") : body.get("fechaUso");
        return ResponseEntity.ok(paseService.actualizar(id,
                nombre == null ? null : nombre.toString(), fecha == null ? null : parseFecha(fecha)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        paseService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    private Long convertirALong(Object value) {
        if (value == null) return null;
        if (value instanceof Number number) return number.longValue();
        try { return Long.valueOf(value.toString().trim()); }
        catch (NumberFormatException exception) { return null; }
    }

    private LocalDate parseFecha(Object value) {
        try { return LocalDate.parse(value.toString()); }
        catch (RuntimeException exception) { throw new IllegalArgumentException("Formato de fecha inválido: " + value); }
    }
}
