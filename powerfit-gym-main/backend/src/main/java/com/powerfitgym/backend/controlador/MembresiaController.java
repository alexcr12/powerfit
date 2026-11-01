package com.powerfitgym.backend.controlador;

import com.powerfitgym.backend.entidad.Membresia;
import com.powerfitgym.backend.servicio.MembresiaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/membresias")
@CrossOrigin(origins = "*")
public class MembresiaController {

    private final MembresiaService membresiaService;

    public MembresiaController(MembresiaService membresiaService) {
        this.membresiaService = membresiaService;
    }

    @GetMapping
    public ResponseEntity<List<Membresia>> listar(
            @RequestParam(required = false, name = "socio_id") Long socioId,
            @RequestParam(required = false) String estado) {

        if (socioId != null) {
            return ResponseEntity.ok(membresiaService.listarPorSocio(socioId));
        }
        if (estado != null && !estado.isBlank()) {
            return ResponseEntity.ok(membresiaService.listarPorEstado(estado));
        }
        return ResponseEntity.ok(membresiaService.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Membresia> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(membresiaService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<Membresia> crear(@RequestBody Membresia membresia) {
        return new ResponseEntity<>(membresiaService.crear(membresia), HttpStatus.CREATED);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Membresia> actualizar(@PathVariable Long id, @RequestBody Membresia membresia) {
        return ResponseEntity.ok(membresiaService.actualizar(id, membresia));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        membresiaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}