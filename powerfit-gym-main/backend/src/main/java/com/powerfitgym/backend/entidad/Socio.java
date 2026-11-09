package com.powerfitgym.backend.entidad;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

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

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "registrado_por", nullable = false)
    @JsonIgnore
    private Usuario registradoPor;

    @JsonProperty("registrado_por")
    public Long getRegistradoPorId() { return registradoPor == null ? null : registradoPor.getId(); }

    @JsonProperty("registrado_por")
    public void setRegistradoPorId(Long id) {
        if (id == null) { this.registradoPor = null; return; }
        Usuario usuario = new Usuario();
        usuario.setId(id);
        this.registradoPor = usuario;
    }

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
    @OneToMany(mappedBy = "socio")
    @JsonIgnore 
    private List<Membresia> membresias;

    @OneToMany(mappedBy = "socio")
    @JsonIgnore
    private List<Asistencia> asistencias;

    @OneToMany(mappedBy = "socio")
    @JsonIgnore
    private List<PaseInvitado> pasesInvitado;
}
