package com.powerfitgym.backend.controlador;

import com.powerfitgym.backend.entidad.Socio;
import com.powerfitgym.backend.repositorio.SocioRepository;
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
    private final SocioRepository socioRepository;

    public SocioController(SocioService socioService, SocioRepository socioRepository) {
        this.socioService = socioService;
        this.socioRepository = socioRepository;
    }

    @GetMapping("/metricas")
    public ResponseEntity<java.util.Map<String, Object>> metricas() {
        return ResponseEntity.ok(socioService.obtenerMetricasSocios());
    }

    @GetMapping
    public ResponseEntity<List<Socio>> listar(
            @RequestParam(required = false) String documento,
            @RequestParam(required = false) Boolean activo) {

        if (documento != null && !documento.isBlank()) {
            return socioRepository.findByDocumento(documento)
                    .filter(socio -> activo == null || activo.equals(socio.getActivo()))
                    .map(socio -> ResponseEntity.ok(List.of(socio)))
                    .orElse(ResponseEntity.ok(List.of()));
        }
        if (activo != null) return ResponseEntity.ok(socioRepository.findByActivo(activo));
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

    @PutMapping("/{id}")
    public ResponseEntity<Socio> actualizar(@PathVariable Long id, @RequestBody Socio socio) {
        return ResponseEntity.ok(socioService.actualizar(id, socio));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Socio> actualizarParcial(@PathVariable Long id, @RequestBody Socio socio) {
        return ResponseEntity.ok(socioService.actualizar(id, socio));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        socioService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
