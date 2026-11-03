package com.powerfitgym.backend.controlador;

import com.powerfitgym.backend.entidad.Categoria;
import com.powerfitgym.backend.entidad.Producto;
import com.powerfitgym.backend.servicio.CategoriaService;
import com.powerfitgym.backend.repositorio.ProductoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/categorias")
@CrossOrigin(origins = "*")
public class CategoriaController {

    private final CategoriaService categoriaService;
    private final ProductoRepository productoRepository;

    public CategoriaController(CategoriaService categoriaService, ProductoRepository productoRepository) {
        this.categoriaService = categoriaService;
        this.productoRepository = productoRepository;
    }

    @GetMapping
    public ResponseEntity<List<Categoria>> listar(@RequestParam(required = false) Boolean activo) {
        if (Boolean.TRUE.equals(activo)) {
            return ResponseEntity.ok(categoriaService.listarActivas());
        }
        return ResponseEntity.ok(categoriaService.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Categoria> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(categoriaService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<Categoria> crear(@RequestBody Map<String, Object> body) {
        Categoria categoria = new Categoria();
        categoria.setNombre(body.get("nombre").toString());
        categoria.setActivo(true);

        // 🔥 LEER EL PRECIO
        if (body.get("precio") != null) {
            categoria.setPrecio(new BigDecimal(body.get("precio").toString()));
        }

        // LEER LOS PRODUCTOS BASE
        if (body.get("beneficiosBase") != null) {
            List<Integer> ids = (List<Integer>) body.get("beneficiosBase");
            List<Producto> productos = new ArrayList<>();
            for (Integer id : ids) {
                productoRepository.findById(Long.valueOf(id)).ifPresent(productos::add);
            }
            categoria.setBeneficiosBase(productos);
        }

        return new ResponseEntity<>(categoriaService.crear(categoria), HttpStatus.CREATED);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Categoria> actualizar(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Categoria datos = new Categoria();
        
        if (body.get("nombre") != null) datos.setNombre(body.get("nombre").toString());
        
        // 🔥 ACTUALIZAR EL PRECIO
        if (body.get("precio") != null) {
            datos.setPrecio(new BigDecimal(body.get("precio").toString()));
        }

        // ACTUALIZAR LOS PRODUCTOS BASE
        if (body.get("beneficiosBase") != null) {
            List<Integer> ids = (List<Integer>) body.get("beneficiosBase");
            List<Producto> productos = new ArrayList<>();
            for (Integer prodId : ids) {
                productoRepository.findById(Long.valueOf(prodId)).ifPresent(productos::add);
            }
            datos.setBeneficiosBase(productos);
        }

        return ResponseEntity.ok(categoriaService.actualizar(id, datos));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        categoriaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}