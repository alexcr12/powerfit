package com.powerfitgym.backend.entidad;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "socios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Socio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "registrado_por", length = 100)
    private String registradoPor;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(nullable = false, unique = true, length = 20)
    private String documento;

    @Column(length = 20)
    private String telefono;

    @Column(name = "fecha_registro", nullable = false)
    private LocalDate fechaRegistro;

    @Column(nullable = false)
    private Boolean activo = true;
    @OneToMany(mappedBy = "socio", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore // Para que no entre en un bucle infinito al pedir los datos
    private List<Membresia> membresias = new ArrayList<>();

    @OneToMany(mappedBy = "socio", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Asistencia> asistencias = new ArrayList<>();

    @OneToMany(mappedBy = "socio", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<PaseInvitado> pasesInvitado = new ArrayList<>();
}