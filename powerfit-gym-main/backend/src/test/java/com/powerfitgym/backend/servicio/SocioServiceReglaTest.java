package com.powerfitgym.backend.servicio;

/* REGLA 2: desactivar un socio NO borra su historial (asistencias, membresías, pases). Prohibido el borrado físico de socios. */

import com.powerfitgym.backend.entidad.Socio;
import com.powerfitgym.backend.repositorio.AsistenciaRepository;
import com.powerfitgym.backend.repositorio.MembresiaRepository;
import com.powerfitgym.backend.repositorio.PaseInvitadoRepository;
import com.powerfitgym.backend.repositorio.SocioRepository;
import com.powerfitgym.backend.repositorio.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SocioServiceReglaTest {
    @Mock private SocioRepository socioRepository;
    @Mock private UsuarioRepository usuarioRepository;
    @Mock private AsistenciaRepository asistenciaRepository;
    @Mock private MembresiaRepository membresiaRepository;
    @Mock private PaseInvitadoRepository paseInvitadoRepository;
    @InjectMocks private SocioService socioService;

    @Test
    void eliminarSocio_desactivaSinBorrarHistorial() {
        Socio socio = new Socio();
        socio.setId(1L);
        socio.setActivo(true);
        when(socioRepository.findById(1L)).thenReturn(Optional.of(socio));
        when(socioRepository.save(socio)).thenReturn(socio);

        socioService.eliminar(1L);

        assertFalse(socio.getActivo());
        verify(socioRepository, never()).deleteById(any());
        verify(asistenciaRepository, never()).deleteAll(any());
        verify(asistenciaRepository, never()).deleteById(any());
        verify(membresiaRepository, never()).deleteAll(any());
        verify(membresiaRepository, never()).delete(any());
        verify(paseInvitadoRepository, never()).deleteAll(any());
        verify(paseInvitadoRepository, never()).deleteById(any());
    }

    @Test
    void actualizarSocio_conActivoTrue_permiteReactivar() {
        Socio socio = new Socio();
        socio.setId(1L);
        socio.setActivo(false);
        Socio datos = new Socio();
        datos.setActivo(true);
        when(socioRepository.findById(1L)).thenReturn(Optional.of(socio));
        when(socioRepository.save(socio)).thenReturn(socio);

        Socio actualizado = socioService.actualizar(1L, datos);

        assertTrue(actualizado.getActivo());
        verify(socioRepository).save(socio);
    }
}
