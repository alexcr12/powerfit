package com.powerfitgym.backend.controlador;

import com.powerfitgym.backend.entidad.MembresiaProducto;
import com.powerfitgym.backend.servicio.MembresiaProductoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/membresia_producto")
@CrossOrigin(origins = "*")
public class MembresiaProductoController {

    private final MembresiaProductoService membresiaProductoService;

    public MembresiaProductoController(MembresiaProductoService membresiaProductoService) {
        this.membresiaProductoService = membresiaProductoService;
    }

    @GetMapping
    public ResponseEntity<List<MembresiaProducto>> listar(
            @RequestParam(required = false, name = "membresia_id") Long membresiaId) {
        if (membresiaId != null) {
            return ResponseEntity.ok(membresiaProductoService.listarPorMembresia(membresiaId));
        }
        return ResponseEntity.ok(List.of());
    }

    @PostMapping
    public ResponseEntity<MembresiaProducto> crear(@RequestBody MembresiaProducto detalle) {
        return new ResponseEntity<>(membresiaProductoService.crear(detalle), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        membresiaProductoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}