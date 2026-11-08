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
public class MembresiaController {

    private final MembresiaService membresiaService;

    public MembresiaController(MembresiaService membresiaService) {
        this.membresiaService = membresiaService;
    }

    @GetMapping
    public ResponseEntity<List<Membresia>> listar(
            @RequestParam(required = false, name = "socio_id") Long socioId,
            @RequestParam(required = false) Boolean activo,
            @RequestParam(required = false) Boolean vigente) {
        return ResponseEntity.ok(membresiaService.listarConFiltros(socioId, activo, vigente));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Membresia> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(membresiaService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<Membresia> crear(@RequestBody Map<String, Object> body) {

        Long idSocio = extraerSocioId(body);
        if (idSocio == null) {
            throw new IllegalArgumentException("El socio es obligatorio para registrar la membresía.");
        }

        Membresia m = new Membresia();

        Object inicio = body.get("fechaInicio") != null ? body.get("fechaInicio") : body.get("fecha_inicio");
        LocalDate fechaInicio = inicio == null ? LocalDate.now() : parseFecha(inicio);
        m.setFechaInicio(fechaInicio);

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
    public ResponseEntity<Membresia> actualizar(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Membresia datos = new Membresia();
        Object inicio = body.containsKey("fecha_inicio") ? body.get("fecha_inicio") : body.get("fechaInicio");
        Object fin = body.containsKey("fecha_fin") ? body.get("fecha_fin") : body.get("fechaFin");
        Object monto = body.containsKey("monto_total") ? body.get("monto_total") : body.get("montoTotal");
        if (inicio != null) datos.setFechaInicio(parseFecha(inicio));
        if (fin != null) datos.setFechaFin(parseFecha(fin));
        if (monto != null) datos.setMontoTotal(parseBigDecimal(monto));
        if (body.get("activo") != null) datos.setActivo(parseBoolean(body.get("activo"), null));
        return ResponseEntity.ok(membresiaService.actualizar(id, datos));
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

    private LocalDate parseFecha(Object valor) {
        try {
            return LocalDate.parse(valor.toString());
        } catch (RuntimeException e) {
            throw new IllegalArgumentException("Formato de fecha inválido: " + valor);
        }
    }

    private BigDecimal parseBigDecimal(Object valor) {
        try {
            return new BigDecimal(valor.toString());
        } catch (RuntimeException e) {
            throw new IllegalArgumentException("monto_total debe ser un número válido.");
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
