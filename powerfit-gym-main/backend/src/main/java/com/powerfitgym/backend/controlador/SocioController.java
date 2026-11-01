package com.powerfitgym.backend.controlador;

import com.powerfitgym.backend.entidad.Socio;
import com.powerfitgym.backend.servicio.SocioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/socios")
@CrossOrigin(origins = "*")
public class SocioController {

    private final SocioService socioService;

    public SocioController(SocioService socioService) {
        this.socioService = socioService;
    }

    @GetMapping
    public ResponseEntity<List<Socio>> listar(
            @RequestParam(required = false) String documento,
            @RequestParam(required = false) Boolean activo) {

        if (documento != null && !documento.isBlank()) {
            return ResponseEntity.ok(List.of(socioService.buscarPorDocumento(documento)));
        }
        if (Boolean.TRUE.equals(activo)) {
            return ResponseEntity.ok(socioService.listarActivos());
        }
        return ResponseEntity.ok(socioService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Socio> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(socioService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<Socio> crear(@RequestBody Socio socio) {
        return new ResponseEntity<>(socioService.crear(socio), HttpStatus.CREATED);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Socio> actualizar(@PathVariable Long id, @RequestBody Socio socio) {
        return ResponseEntity.ok(socioService.actualizar(id, socio));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        socioService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}