package com.powerfitgym.backend.entidad;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "productos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id", nullable = false)
    @JsonProperty("categoria_id")
    private Categoria categoria;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(name = "requiere_asistencia", nullable = false)
    private Boolean requiereAsistencia = false;

    @Column(nullable = false)
    private Boolean activo = true;
}
