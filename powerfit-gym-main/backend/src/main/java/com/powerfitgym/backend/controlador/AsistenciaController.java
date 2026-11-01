package com.powerfitgym.backend.controlador;

import com.powerfitgym.backend.entidad.Asistencia;
import com.powerfitgym.backend.servicio.AsistenciaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/asistencias")
@CrossOrigin(origins = "*")
public class AsistenciaController {

    private final AsistenciaService asistenciaService;

    public AsistenciaController(AsistenciaService asistenciaService) {
        this.asistenciaService = asistenciaService;
    }

    @GetMapping
    public ResponseEntity<List<Asistencia>> listar(
            @RequestParam(required = false, name = "socio_id") Long socioId) {
        if (socioId != null) {
            return ResponseEntity.ok(asistenciaService.listarPorSocio(socioId));
        }
        return ResponseEntity.ok(asistenciaService.listarTodas());
    }

    @PostMapping
    public ResponseEntity<Asistencia> registrar(@RequestBody Asistencia asistencia) {
        return new ResponseEntity<>(asistenciaService.registrar(asistencia), HttpStatus.CREATED);
    }
}