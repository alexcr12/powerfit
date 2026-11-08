package com.powerfitgym.backend.controlador;

import com.powerfitgym.backend.entidad.Asistencia;
import com.powerfitgym.backend.servicio.AsistenciaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/asistencias")
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

    @GetMapping("/contador-hoy")
    public ResponseEntity<List<Map<String, Object>>> contadorHoy() {
        return ResponseEntity.ok(asistenciaService.contarHoyPorClase(LocalDate.now()));
    }

    @PostMapping
    public ResponseEntity<Asistencia> registrar(@RequestBody Map<String, Object> body) {

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

        Object productoId = body.get("producto_id") != null ? body.get("producto_id") : body.get("productoId");
        if (productoId == null && body.get("producto") instanceof Map<?, ?> pm) productoId = pm.get("id");
        if (productoId == null) throw new IllegalArgumentException("El producto_id es obligatorio.");
        com.powerfitgym.backend.entidad.Producto producto = new com.powerfitgym.backend.entidad.Producto();
        producto.setId(Long.valueOf(productoId.toString()));
        asistencia.setProducto(producto);

        Asistencia nuevaAsistencia = asistenciaService.registrar(asistencia);
        publicarContador(nuevaAsistencia.getProducto().getId(), nuevaAsistencia.getFechaHora().toLocalDate());
        return new ResponseEntity<>(nuevaAsistencia, HttpStatus.CREATED);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Asistencia> actualizar(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {

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

        Object productoId = body.get("producto_id") != null ? body.get("producto_id") : body.get("productoId");
        if (productoId == null && body.get("producto") instanceof Map<?, ?> pm) productoId = pm.get("id");
        if (productoId != null) {
            com.powerfitgym.backend.entidad.Producto pRef = new com.powerfitgym.backend.entidad.Producto();
            pRef.setId(Long.valueOf(productoId.toString()));
            datos.setProducto(pRef);
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

        Asistencia anterior = asistenciaService.buscarPorId(id);
        Long productoAnterior = anterior.getProducto().getId();
        LocalDate fechaAnterior = anterior.getFechaHora().toLocalDate();
        Asistencia actualizada = asistenciaService.actualizar(id, datos);
        Long productoNuevo = actualizada.getProducto().getId();
        LocalDate fechaNueva = actualizada.getFechaHora().toLocalDate();
        if (!productoAnterior.equals(productoNuevo) || !fechaAnterior.equals(fechaNueva)) {
            publicarContador(productoAnterior, fechaAnterior);
            publicarContador(productoNuevo, fechaNueva);
        }
        return ResponseEntity.ok(actualizada);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        Asistencia asistencia = asistenciaService.buscarPorId(id);
        Long productoId = asistencia.getProducto().getId();
        LocalDate fecha = asistencia.getFechaHora().toLocalDate();
        asistenciaService.eliminar(id);
        publicarContador(productoId, fecha);
        return ResponseEntity.noContent().build();
    }

    private void publicarContador(Long productoId, LocalDate fecha) {
        com.powerfitgym.backend.entidad.Producto producto = asistenciaService.buscarProducto(productoId);
        long total = asistenciaService.contarPorProductoYFecha(productoId, fecha);
        Map<String, Object> mensaje = Map.of(
                "productoId", productoId,
                "producto", producto.getNombre(),
                "total", total,
                "fecha", fecha.toString());
        messagingTemplate.convertAndSend("/topic/asistencias", mensaje);
    }
}
