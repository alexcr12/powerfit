package com.powerfitgym.backend.entidad;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "categorias")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Categoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false)
    private Boolean activo = true;

    // 🔥 NUEVO CAMPO PRECIO
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precio = new BigDecimal("150.00");

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "categoria_beneficios_base", joinColumns = @JoinColumn(name = "categoria_id"), inverseJoinColumns = @JoinColumn(name = "producto_id"))
    private List<Producto> beneficiosBase;
}