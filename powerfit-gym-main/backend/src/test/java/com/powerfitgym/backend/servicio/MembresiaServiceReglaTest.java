package com.powerfitgym.backend.servicio;

import com.powerfitgym.backend.entidad.Categoria;
import com.powerfitgym.backend.entidad.Membresia;
import com.powerfitgym.backend.entidad.Socio;
import com.powerfitgym.backend.excepcion.ReglaNegocioException;
import com.powerfitgym.backend.repositorio.CategoriaRepository;
import com.powerfitgym.backend.repositorio.MembresiaRepository;
import com.powerfitgym.backend.repositorio.SocioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MembresiaServiceReglaTest {
    @Mock private MembresiaRepository membresiaRepository;
    @Mock private SocioRepository socioRepository;
    @Mock private CategoriaRepository categoriaRepository;
    @InjectMocks private MembresiaService membresiaService;

    private Socio socio;

    @BeforeEach
    void preparar() {
        ReflectionTestUtils.setField(membresiaService, "precioMembresia", new BigDecimal("123.45"));
        socio = new Socio();
        socio.setId(1L);
        socio.setActivo(true);
        lenient().when(socioRepository.findById(1L)).thenReturn(Optional.of(socio));
    }

    @Test
    void crearMembresia_conCategoriaDesactivada_rechaza() {
        Categoria categoria = categoria(10L, "Fit", false);
        when(categoriaRepository.findById(10L)).thenReturn(Optional.of(categoria));

        assertThrows(ReglaNegocioException.class, () -> membresiaService.crear(nuevaMembresia(categoria)));
        verify(membresiaRepository, never()).save(any());
    }

    @Test
    void crearMembresia_conDosCategoriasDistintasPermiteVigenciasParalelas() {
        Categoria fit = categoria(10L, "Fit", true);
        Categoria black = categoria(11L, "Black", true);
        when(categoriaRepository.findById(10L)).thenReturn(Optional.of(fit));
        when(categoriaRepository.findById(11L)).thenReturn(Optional.of(black));
        when(membresiaRepository.save(any(Membresia.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(membresiaRepository.existsBySocioIdAndCategoriaIdAndActivoTrueAndFechaFinGreaterThanEqual(
                eq(1L), anyLong(), any(LocalDate.class))).thenReturn(false);

        Membresia fitCreada = membresiaService.crear(nuevaMembresia(fit));
        Membresia blackCreada = membresiaService.crear(nuevaMembresia(black));

        assertEquals(10L, fitCreada.getCategoria().getId());
        assertEquals(11L, blackCreada.getCategoria().getId());
        verify(membresiaRepository, times(2)).save(any(Membresia.class));
    }

    @Test
    void crearMembresia_conOtraVigenteDeLaMismaCategoria_rechaza() {
        Categoria fit = categoria(10L, "Fit", true);
        when(categoriaRepository.findById(10L)).thenReturn(Optional.of(fit));
        when(membresiaRepository.existsBySocioIdAndCategoriaIdAndActivoTrueAndFechaFinGreaterThanEqual(
                1L, 10L, LocalDate.now())).thenReturn(true);

        assertThrows(ReglaNegocioException.class, () -> membresiaService.crear(nuevaMembresia(fit)));
        verify(membresiaRepository, never()).save(any());
    }

    @Test
    void crearMembresia_calculaUnMesYUsaPrecioConfigurado() {
        Categoria fit = categoria(10L, "Fit", true);
        when(categoriaRepository.findById(10L)).thenReturn(Optional.of(fit));
        when(membresiaRepository.existsBySocioIdAndCategoriaIdAndActivoTrueAndFechaFinGreaterThanEqual(
                eq(1L), eq(10L), any(LocalDate.class))).thenReturn(false);
        when(membresiaRepository.save(any(Membresia.class))).thenAnswer(invocation -> invocation.getArgument(0));
        Membresia membresia = nuevaMembresia(fit);
        membresia.setFechaInicio(LocalDate.of(2026, 1, 31));
        membresia.setMontoTotal(new BigDecimal("999.99"));

        Membresia creada = membresiaService.crear(membresia);

        assertEquals(LocalDate.of(2026, 2, 28), creada.getFechaFin());
        assertEquals(new BigDecimal("123.45"), creada.getMontoTotal());
        assertTrue(creada.getActivo());
    }

    @Test
    void desactivarCategoria_noModificaMembresiasVigentesExistentes() {
        Categoria categoria = categoria(10L, "Fit", true);
        CategoriaService categoriaService = new CategoriaService(categoriaRepository);
        when(categoriaRepository.findById(10L)).thenReturn(Optional.of(categoria));
        when(categoriaRepository.save(categoria)).thenReturn(categoria);

        categoriaService.eliminar(10L);

        assertFalse(categoria.getActivo());
        verify(membresiaRepository, never()).save(any());
        verify(membresiaRepository, never()).saveAll(any());
    }

    private Membresia nuevaMembresia(Categoria categoria) {
        Membresia membresia = new Membresia();
        membresia.setSocio(socio);
        membresia.setCategoria(categoria);
        membresia.setFechaInicio(LocalDate.now());
        membresia.setMontoTotal(new BigDecimal("100.00"));
        return membresia;
    }

    private Categoria categoria(Long id, String nombre, boolean activa) {
        Categoria categoria = new Categoria();
        categoria.setId(id);
        categoria.setNombre(nombre);
        categoria.setActivo(activa);
        return categoria;
    }
}
