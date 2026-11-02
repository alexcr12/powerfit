package com.powerfitgym.backend.controlador;

import com.powerfitgym.backend.entidad.Membresia;
import com.powerfitgym.backend.entidad.MembresiaProducto;
import com.powerfitgym.backend.entidad.Producto;
import com.powerfitgym.backend.servicio.MembresiaProductoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/membresia_producto")
@CrossOrigin(origins = "*")
public class MembresiaProductoController {

    private final MembresiaProductoService service;

    public MembresiaProductoController(MembresiaProductoService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<MembresiaProducto>> listar(
            @RequestParam(required = false, name = "membresia_id") Long membresiaId) {

        if (membresiaId != null) {
            return ResponseEntity.ok(service.listarPorMembresia(membresiaId));
        }
        return ResponseEntity.ok(service.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MembresiaProducto> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<MembresiaProducto> crear(@RequestBody Map<String, Object> body) {

        // 🔍 DEBUG
        System.out.println("=== BODY MEMBRESIA_PRODUCTO: " + body);

        Long membresiaId = extraerLong(body, "membresia_id", "membresiaId");
        Long productoId = extraerLong(body, "producto_id", "productoId");

        // Fallback: si vienen anidados { membresia: { id } } o { producto: { id } }
        if (membresiaId == null && body.get("membresia") instanceof Map<?, ?> mm) {
            if (mm.get("id") != null)
                membresiaId = Long.valueOf(mm.get("id").toString());
        }
        if (productoId == null && body.get("producto") instanceof Map<?, ?> pm) {
            if (pm.get("id") != null)
                productoId = Long.valueOf(pm.get("id").toString());
        }

        if (membresiaId == null) {
            throw new IllegalArgumentException("El membresia_id es obligatorio.");
        }
        if (productoId == null) {
            throw new IllegalArgumentException("El producto_id es obligatorio.");
        }

        MembresiaProducto mp = new MembresiaProducto();

        // Referencias por ID (el servicio las carga desde BD)
        Membresia mRef = new Membresia();
        mRef.setId(membresiaId);
        mp.setMembresia(mRef);

        Producto pRef = new Producto();
        pRef.setId(productoId);
        mp.setProducto(pRef);

        // Precio unitario (acepta precio_unitario o precioUnitario)
        Object precio = body.get("precio_unitario") != null
                ? body.get("precio_unitario")
                : body.get("precioUnitario");
        mp.setPrecioUnitario(precio != null ? new BigDecimal(precio.toString()) : BigDecimal.ZERO);

        // Cantidad disponible
        Object cantidad = body.get("cantidad_disponible") != null
                ? body.get("cantidad_disponible")
                : body.get("cantidadDisponible");
        mp.setCantidadDisponible(cantidad != null ? Integer.valueOf(cantidad.toString()) : 1);

        MembresiaProducto creada = service.crear(mp);
        System.out.println("=== MEMBRESIA_PRODUCTO CREADA ID: " + creada.getId());
        return new ResponseEntity<>(creada, HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    // ---------- helpers ----------
    private Long extraerLong(Map<String, Object> body, String... keys) {
        for (String k : keys) {
            Object v = body.get(k);
            if (v != null) {
                try {
                    return Long.valueOf(v.toString());
                } catch (NumberFormatException ignored) {
                }
            }
        }
        return null;
    }
}