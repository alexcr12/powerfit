package com.powerfitgym.backend.controlador;

import com.powerfitgym.backend.entidad.Categoria;
import com.powerfitgym.backend.entidad.Producto;
import com.powerfitgym.backend.servicio.ProductoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/productos")
public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    @GetMapping
    public ResponseEntity<List<Producto>> listar(
            @RequestParam(required = false, name = "categoria_id") Long categoriaId,
            @RequestParam(required = false) Boolean activo) {

        return ResponseEntity.ok(productoService.listarConFiltros(categoriaId, activo));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Producto> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(productoService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<Producto> crear(@RequestBody Map<String, Object> body) {
        Producto producto = new Producto();
        producto.setNombre(body.get("nombre").toString());
        Object requiereAsistencia = body.get("requiere_asistencia") != null ? body.get("requiere_asistencia") : body.get("requiereAsistencia");
        producto.setRequiereAsistencia(requiereAsistencia != null && Boolean.parseBoolean(requiereAsistencia.toString()));

        Object activo = body.get("activo");
        producto.setActivo(activo == null || Boolean.parseBoolean(activo.toString()));

        Object catIdObj = body.get("categoria_id") != null ? body.get("categoria_id") : body.get("categoriaId");
        if (catIdObj != null) {
            Categoria catRef = new Categoria();
            catRef.setId(Long.valueOf(catIdObj.toString()));
            producto.setCategoria(catRef);
        }

        return new ResponseEntity<>(productoService.crear(producto), HttpStatus.CREATED);
    }

    // 🔥 SOLO HAY UN PATCH AQUÍ
    @PatchMapping("/{id}")
    public ResponseEntity<Producto> actualizar(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Producto datos = new Producto();
        if (body.get("nombre") != null)
            datos.setNombre(body.get("nombre").toString());
        Object requiereAsistencia = body.get("requiere_asistencia") != null ? body.get("requiere_asistencia") : body.get("requiereAsistencia");
        if (requiereAsistencia != null)
            datos.setRequiereAsistencia(Boolean.parseBoolean(requiereAsistencia.toString()));
        if (body.get("activo") != null)
            datos.setActivo(Boolean.parseBoolean(body.get("activo").toString()));

        Object catIdObj = body.get("categoria_id") != null ? body.get("categoria_id") : body.get("categoriaId");
        if (catIdObj != null) {
            Categoria catRef = new Categoria();
            catRef.setId(Long.valueOf(catIdObj.toString()));
            datos.setCategoria(catRef);
        }

        return ResponseEntity.ok(productoService.actualizar(id, datos));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        productoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
