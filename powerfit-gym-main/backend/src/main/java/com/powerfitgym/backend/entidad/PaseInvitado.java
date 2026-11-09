package com.powerfitgym.backend.entidad;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "pases_invitado")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class PaseInvitado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "socio_id", nullable = false)
    private Socio socio;

    @Column(name = "nombre_inv", nullable = false, length = 100)
    private String nombreInv;

    @Column(name = "fecha_uso", nullable = false)
    private LocalDate fechaUso;

    @Column(nullable = false)
    private Boolean activo = true;
}
