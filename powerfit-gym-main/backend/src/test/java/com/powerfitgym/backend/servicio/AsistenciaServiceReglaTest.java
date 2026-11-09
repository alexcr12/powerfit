package com.powerfitgym.backend.servicio;

import com.powerfitgym.backend.entidad.Asistencia;
import com.powerfitgym.backend.entidad.Categoria;
import com.powerfitgym.backend.entidad.Membresia;
import com.powerfitgym.backend.entidad.Producto;
import com.powerfitgym.backend.entidad.Socio;
import com.powerfitgym.backend.excepcion.ReglaNegocioException;
import com.powerfitgym.backend.repositorio.AsistenciaRepository;
import com.powerfitgym.backend.repositorio.MembresiaRepository;
import com.powerfitgym.backend.repositorio.ProductoRepository;
import com.powerfitgym.backend.repositorio.SocioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AsistenciaServiceReglaTest {
    @Mock private AsistenciaRepository asistenciaRepository;
    @Mock private SocioRepository socioRepository;
    @Mock private ProductoRepository productoRepository;
    @Mock private MembresiaRepository membresiaRepository;
    @InjectMocks private AsistenciaService asistenciaService;

    private Socio socio;
    private Producto danza;
    private Categoria black;
    private LocalDateTime fechaHora;

    @BeforeEach
    void preparar() {
        socio = new Socio();
        socio.setId(1L);
        socio.setActivo(true);
        black = new Categoria();
        black.setId(2L);
        black.setNombre("Black");
        black.setActivo(true);
        danza = new Producto();
        danza.setId(3L);
        danza.setNombre("Danza");
        danza.setActivo(true);
        danza.setRequiereAsistencia(true);
        danza.setCategoria(black);
        fechaHora = LocalDate.of(2026, 11, 8).atTime(10, 0);
        when(socioRepository.findById(1L)).thenReturn(Optional.of(socio));
        lenient().when(productoRepository.findById(3L)).thenReturn(Optional.of(danza));
    }

    @Test
    void registrarAsistencia_conMembresiaVigenteDelTipoCorrecto_seGuarda() {
        when(membresiaRepository.existsBySocioIdAndCategoriaIdAndActivoTrueAndFechaInicioLessThanEqualAndFechaFinGreaterThanEqual(
                1L, 2L, fechaHora.toLocalDate(), fechaHora.toLocalDate())).thenReturn(true);
        when(asistenciaRepository.save(any(Asistencia.class))).thenAnswer(invocation -> invocation.getArgument(0));
        Asistencia asistencia = nuevaAsistencia();

        Asistencia guardada = asistenciaService.registrar(asistencia);

        assertSame(asistencia, guardada);
        verify(asistenciaRepository).save(asistencia);
    }

    @Test
    void registrarAsistencia_conMembresiaDeOtraCategoria_rechazaYNoGuarda() {
        when(membresiaRepository.existsBySocioIdAndCategoriaIdAndActivoTrueAndFechaInicioLessThanEqualAndFechaFinGreaterThanEqual(
                1L, 2L, fechaHora.toLocalDate(), fechaHora.toLocalDate())).thenReturn(false);

        assertThrows(ReglaNegocioException.class, () -> asistenciaService.registrar(nuevaAsistencia()));
        verify(asistenciaRepository, never()).save(any());
    }

    @Test
    void registrarAsistencia_conSocioInactivo_rechazaYNoGuarda() {
        socio.setActivo(false);

        assertThrows(ReglaNegocioException.class, () -> asistenciaService.registrar(nuevaAsistencia()));
        verify(asistenciaRepository, never()).save(any());
        verifyNoInteractions(membresiaRepository);
    }

    @Test
    void registrarAsistencia_conProductoQueNoRequiereAsistencia_rechazaYNoGuarda() {
        danza.setRequiereAsistencia(false);

        assertThrows(ReglaNegocioException.class, () -> asistenciaService.registrar(nuevaAsistencia()));
        verify(asistenciaRepository, never()).save(any());
        verifyNoInteractions(membresiaRepository);
    }

    @Test
    void registrarAsistencia_conCategoriaDesactivadaYMembresiaVigente_sePermite() {
        black.setActivo(false);
        when(membresiaRepository.existsBySocioIdAndCategoriaIdAndActivoTrueAndFechaInicioLessThanEqualAndFechaFinGreaterThanEqual(
                1L, 2L, fechaHora.toLocalDate(), fechaHora.toLocalDate())).thenReturn(true);
        when(asistenciaRepository.save(any(Asistencia.class))).thenAnswer(invocation -> invocation.getArgument(0));

        assertDoesNotThrow(() -> asistenciaService.registrar(nuevaAsistencia()));
        verify(membresiaRepository).existsBySocioIdAndCategoriaIdAndActivoTrueAndFechaInicioLessThanEqualAndFechaFinGreaterThanEqual(
                1L, 2L, fechaHora.toLocalDate(), fechaHora.toLocalDate());
        verify(asistenciaRepository).save(any(Asistencia.class));
    }

    private Asistencia nuevaAsistencia() {
        Asistencia asistencia = new Asistencia();
        asistencia.setSocio(socio);
        asistencia.setProducto(danza);
        asistencia.setFechaHora(fechaHora);
        return asistencia;
    }
}
