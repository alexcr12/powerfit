package com.powerfitgym.backend.controlador;

import com.powerfitgym.backend.entidad.Asistencia;
import com.powerfitgym.backend.servicio.AsistenciaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/asistencias")
@CrossOrigin(origins = "*")
public class AsistenciaController {

    private final AsistenciaService asistenciaService;
    private final SimpMessagingTemplate messagingTemplate; 
    
    public AsistenciaController(AsistenciaService asistenciaService, SimpMessagingTemplate messagingTemplate) {
        this.asistenciaService = asistenciaService;
        this.messagingTemplate = messagingTemplate;
    }

    @GetMapping
    public ResponseEntity<List<Asistencia>> listar(
            @RequestParam(required = false, name = "socio_id") Long socioId) {
        if (socioId != null) {
            return ResponseEntity.ok(asistenciaService.listarPorSocio(socioId));
        }
        return ResponseEntity.ok(asistenciaService.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Asistencia> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(asistenciaService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<Asistencia> registrar(@RequestBody Map<String, Object> body) {

        System.out.println("=== BODY ASISTENCIA: " + body);

        Object socioIdObj = body.get("socio_id") != null ? body.get("socio_id") : body.get("socioId");
        if (socioIdObj == null && body.get("socio") instanceof Map<?, ?> sm) {
            socioIdObj = sm.get("id");
        }

        if (socioIdObj == null) {
            throw new IllegalArgumentException("El socio_id es obligatorio para registrar la asistencia.");
        }

        Asistencia asistencia = new Asistencia();

        com.powerfitgym.backend.entidad.Socio socioRef = new com.powerfitgym.backend.entidad.Socio();
        socioRef.setId(Long.valueOf(socioIdObj.toString()));
        asistencia.setSocio(socioRef);

        Object fh = body.get("fecha_hora") != null ? body.get("fecha_hora") : body.get("fechaHora");
        if (fh != null) {
            String fechaStr = fh.toString().trim();
            try {
                asistencia.setFechaHora(LocalDateTime.parse(fechaStr));
            } catch (Exception e) {
                try {
                    java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter
                            .ofPattern("yyyy-MM-dd HH:mm");
                    asistencia.setFechaHora(LocalDateTime.parse(fechaStr, formatter));
                } catch (Exception ex) {
                    try {
                        java.time.format.DateTimeFormatter formatterWithSecs = java.time.format.DateTimeFormatter
                                .ofPattern("yyyy-MM-dd HH:mm:ss");
                        asistencia.setFechaHora(LocalDateTime.parse(fechaStr, formatterWithSecs));
                    } catch (Exception ex2) {
                        throw new IllegalArgumentException("Formato de fecha inválido: " + fechaStr);
                    }
                }
            }
        } else {
            asistencia.setFechaHora(LocalDateTime.now());
        }

        if (body.get("sede") != null) {
            asistencia.setSede(body.get("sede").toString());
        } else {
            asistencia.setSede("Sede Central");
        }

        Asistencia nuevaAsistencia = asistenciaService.registrar(asistencia);
        messagingTemplate.convertAndSend("/topic/asistencias", nuevaAsistencia);
        System.out.println("📢 MENSAJE WEBSOCKET ENVIADO");

        return new ResponseEntity<>(nuevaAsistencia, HttpStatus.CREATED);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Asistencia> actualizar(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {

        System.out.println("=== PATCH ASISTENCIA ID " + id + " BODY: " + body);

        Asistencia datos = new Asistencia();

        Object fh = body.get("fecha_hora") != null ? body.get("fecha_hora") : body.get("fechaHora");
        if (fh != null) {
            String fechaStr = fh.toString().trim();
            try {
                datos.setFechaHora(LocalDateTime.parse(fechaStr));
            } catch (Exception e) {
                try {
                    java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter
                            .ofPattern("yyyy-MM-dd HH:mm");
                    datos.setFechaHora(LocalDateTime.parse(fechaStr, formatter));
                } catch (Exception ex) {
                    try {
                        java.time.format.DateTimeFormatter formatterWithSecs = java.time.format.DateTimeFormatter
                                .ofPattern("yyyy-MM-dd HH:mm:ss");
                        datos.setFechaHora(LocalDateTime.parse(fechaStr, formatterWithSecs));
                    } catch (Exception ex2) {
                        throw new IllegalArgumentException("Formato de fecha inválido: " + fechaStr);
                    }
                }
            }
        }

        if (body.get("sede") != null) {
            datos.setSede(body.get("sede").toString());
        }

        Object socioIdObj = body.get("socio_id") != null ? body.get("socio_id") : body.get("socioId");
        if (socioIdObj == null && body.get("socio") instanceof Map<?, ?> sm) {
            socioIdObj = sm.get("id");
        }
        if (socioIdObj != null) {
            com.powerfitgym.backend.entidad.Socio sRef = new com.powerfitgym.backend.entidad.Socio();
            sRef.setId(Long.valueOf(socioIdObj.toString()));
            datos.setSocio(sRef);
        }

        Asistencia actualizada = asistenciaService.actualizar(id, datos);
        return ResponseEntity.ok(actualizada);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        asistenciaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}