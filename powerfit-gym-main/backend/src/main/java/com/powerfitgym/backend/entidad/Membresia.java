package com.powerfitgym.backend.entidad;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "membresias")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class Membresia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "socio_id", nullable = false)
    private Socio socio;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @JsonFormat(pattern = "yyyy-MM-dd")
    @Column(name = "fecha_fin", nullable = false)
    private LocalDate fechaFin;

    @Column(name = "monto_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal montoTotal;

    @Column(nullable = false, length = 30)
    private String estado = "activa";

    @Column(name = "es_primera", nullable = false)
    private Boolean esPrimera = false;

    @PrePersist
    public void prePersist() {
        if (this.fechaInicio == null) {
            this.fechaInicio = LocalDate.now();
        }
        if (this.fechaFin == null) {
            this.fechaFin = this.fechaInicio.plusMonths(1);
        }
        if (this.esPrimera == null) {
            this.esPrimera = false;
        }
        if (this.estado == null || this.estado.isBlank()) {
            this.estado = "activa";
        }
    }
}