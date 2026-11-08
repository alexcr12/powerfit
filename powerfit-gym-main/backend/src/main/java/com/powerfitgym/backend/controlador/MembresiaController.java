package com.powerfitgym.backend.controlador;

import com.powerfitgym.backend.entidad.Membresia;
import com.powerfitgym.backend.entidad.Socio;
import com.powerfitgym.backend.servicio.MembresiaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

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
            @RequestParam(required = false) Boolean activo) {

        if (socioId != null) {
            return ResponseEntity.ok(membresiaService.listarPorSocio(socioId));
        }
        if (activo != null) {
            return ResponseEntity.ok(membresiaService.listarPorActivo(activo));
        }
        return ResponseEntity.ok(membresiaService.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Membresia> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(membresiaService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<Membresia> crear(@RequestBody Map<String, Object> body) {

        System.out.println("=== BODY RECIBIDO: " + body);

        Long idSocio = extraerSocioId(body);
        if (idSocio == null) {
            throw new IllegalArgumentException("El socio es obligatorio para registrar la membresía.");
        }

        Membresia m = new Membresia();

        LocalDate fechaInicio = parseFecha(
                body.get("fechaInicio") != null ? body.get("fechaInicio") : body.get("fecha_inicio"),
                LocalDate.now());
        m.setFechaInicio(fechaInicio);

        Object monto = body.get("montoTotal") != null ? body.get("montoTotal") : body.get("monto_total");
        m.setMontoTotal(parseBigDecimal(monto, BigDecimal.ZERO));

        Object activo = body.get("activo");
        m.setActivo(activo == null || parseBoolean(activo, true));

        Socio socioRef = new Socio();
        socioRef.setId(idSocio);
        m.setSocio(socioRef);

        Object categoriaId = body.get("categoria_id") != null ? body.get("categoria_id") : body.get("categoriaId");
        if (categoriaId == null && body.get("categoria") instanceof Map<?, ?> categoriaMap) categoriaId = categoriaMap.get("id");
        if (categoriaId == null) throw new IllegalArgumentException("La categoria_id es obligatoria para registrar la membresía.");
        com.powerfitgym.backend.entidad.Categoria categoria = new com.powerfitgym.backend.entidad.Categoria();
        categoria.setId(convertirALong(categoriaId));
        m.setCategoria(categoria);

        return new ResponseEntity<>(membresiaService.crear(m), HttpStatus.CREATED);
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

    private Long extraerSocioId(Map<String, Object> body) {
        if (body.get("socioId") != null)
            return convertirALong(body.get("socioId"));
        if (body.get("socio_id") != null)
            return convertirALong(body.get("socio_id"));
        Object socioObj = body.get("socio");
        if (socioObj instanceof Map<?, ?> sMap) {
            if (sMap.get("id") != null)
                return convertirALong(sMap.get("id"));
        }
        if (socioObj instanceof Number || socioObj instanceof String) {
            return convertirALong(socioObj);
        }
        return null;
    }

    private Long convertirALong(Object valor) {
        if (valor == null)
            return null;
        if (valor instanceof Number n)
            return n.longValue();
        try {
            return Long.valueOf(valor.toString().trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private LocalDate parseFecha(Object valor, LocalDate porDefecto) {
        if (valor == null)
            return porDefecto;
        try {
            return LocalDate.parse(valor.toString());
        } catch (Exception e) {
            return porDefecto;
        }
    }

    private BigDecimal parseBigDecimal(Object valor, BigDecimal porDefecto) {
        if (valor == null)
            return porDefecto;
        try {
            return new BigDecimal(valor.toString());
        } catch (Exception e) {
            return porDefecto;
        }
    }

    private Boolean parseBoolean(Object valor, Boolean porDefecto) {
        if (valor == null)
            return porDefecto;
        if (valor instanceof Boolean b)
            return b;
        String s = valor.toString().trim().toLowerCase();
        if (s.equals("true") || s.equals("1"))
            return true;
        if (s.equals("false") || s.equals("0"))
            return false;
        return porDefecto;
    }
}
