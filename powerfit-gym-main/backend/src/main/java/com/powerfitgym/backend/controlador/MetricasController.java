package com.powerfitgym.backend.controlador;

import com.powerfitgym.backend.servicio.MetricasService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/metricas")
public class MetricasController {
    private final MetricasService metricasService;

    public MetricasController(MetricasService metricasService) {
        this.metricasService = metricasService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> obtenerMetricas() {
        return ResponseEntity.ok(metricasService.obtenerMetricas());
    }
}
