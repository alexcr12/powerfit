package com.powerfitgym.backend.entidad;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.Pattern;
import lombok.*;
@Entity
@Table(name = "usuarios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column (nullable = false, length = 100)
    private String nombre;
    @Column (nullable = false,unique= true, length = 100)
    private String email;
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column (nullable = false , length = 100)
    private String password;
    @Pattern(regexp = "admin|staff", message = "El rol debe ser admin o staff")
    @Column (nullable = false, length = 10)
    private String rol;
    @Column(nullable = false)
    private Boolean activo = true;
}
