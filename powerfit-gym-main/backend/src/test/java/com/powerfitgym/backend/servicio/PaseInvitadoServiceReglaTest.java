package com.powerfitgym.backend.servicio;

import com.powerfitgym.backend.entidad.Membresia;
import com.powerfitgym.backend.entidad.PaseInvitado;
import com.powerfitgym.backend.entidad.Socio;
import com.powerfitgym.backend.excepcion.ReglaNegocioException;
import com.powerfitgym.backend.repositorio.MembresiaRepository;
import com.powerfitgym.backend.repositorio.PaseInvitadoRepository;
import com.powerfitgym.backend.repositorio.SocioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaseInvitadoServiceReglaTest {
    @Mock private PaseInvitadoRepository paseRepository;
    @Mock private SocioRepository socioRepository;
    @Mock private MembresiaRepository membresiaRepository;
    @InjectMocks private PaseInvitadoService paseService;

    private Socio socio;
    private LocalDate fecha;

    @BeforeEach
    void preparar() {
        socio = new Socio();
        socio.setId(1L);
        socio.setActivo(true);
        fecha = LocalDate.of(2026, 11, 8);
        when(socioRepository.findById(1L)).thenReturn(Optional.of(socio));
    }

    @Test
    void crearPase_conUnaSolaMembresiaPermiteElTercerPaseDelMes() {
        when(membresiaRepository.countBySocioId(1L)).thenReturn(1L);
        when(membresiaRepository.existsBySocioIdAndActivoTrueAndFechaInicioLessThanEqualAndFechaFinGreaterThanEqual(
                1L, fecha, fecha)).thenReturn(true);
        when(paseRepository.countBySocioIdAndActivoTrueAndFechaUsoBetween(eq(1L), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(2L);
        when(paseRepository.saveAndFlush(any(PaseInvitado.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PaseInvitado creado = paseService.crear(nuevoPase());

        assertTrue(creado.getActivo());
        verify(paseRepository).saveAndFlush(any(PaseInvitado.class));
    }

    @Test
    void crearPase_conDosOMasMembresias_rechazaElTercerPase() {
        when(membresiaRepository.countBySocioId(1L)).thenReturn(2L);
        when(membresiaRepository.existsBySocioIdAndActivoTrueAndFechaInicioLessThanEqualAndFechaFinGreaterThanEqual(
                1L, fecha, fecha)).thenReturn(true);
        when(paseRepository.countBySocioIdAndActivoTrueAndFechaUsoBetween(eq(1L), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(2L);

        assertThrows(ReglaNegocioException.class, () -> paseService.crear(nuevoPase()));
        verify(paseRepository, never()).saveAndFlush(any());
    }

    @Test
    void crearPase_sinMembresiaVigenteEnLaFecha_rechaza() {
        when(membresiaRepository.existsBySocioIdAndActivoTrueAndFechaInicioLessThanEqualAndFechaFinGreaterThanEqual(
                1L, fecha, fecha)).thenReturn(false);

        assertThrows(ReglaNegocioException.class, () -> paseService.crear(nuevoPase()));
        verify(paseRepository, never()).saveAndFlush(any());
        verify(membresiaRepository, never()).countBySocioId(anyLong());
    }

    @Test
    void crearPase_losPasesAnuladosNoCuentanParaElTope() {
        when(membresiaRepository.countBySocioId(1L)).thenReturn(2L);
        when(membresiaRepository.existsBySocioIdAndActivoTrueAndFechaInicioLessThanEqualAndFechaFinGreaterThanEqual(
                1L, fecha, fecha)).thenReturn(true);
        when(paseRepository.countBySocioIdAndActivoTrueAndFechaUsoBetween(eq(1L), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(1L);
        when(paseRepository.saveAndFlush(any(PaseInvitado.class))).thenAnswer(invocation -> invocation.getArgument(0));

        assertDoesNotThrow(() -> paseService.crear(nuevoPase()));
        verify(paseRepository).countBySocioIdAndActivoTrueAndFechaUsoBetween(eq(1L), any(LocalDate.class), any(LocalDate.class));
        verify(paseRepository).saveAndFlush(any(PaseInvitado.class));
    }

    private PaseInvitado nuevoPase() {
        PaseInvitado pase = new PaseInvitado();
        pase.setSocio(socio);
        pase.setNombreInv("Invitado de prueba");
        pase.setFechaUso(fecha);
        return pase;
    }
}
