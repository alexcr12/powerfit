package com.powerfitgym.backend.controlador;

import com.powerfitgym.backend.excepcion.ReglaNegocioException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> manejarArgumentoInvalido(IllegalArgumentException exception) {
        return ResponseEntity.badRequest().body(Map.of("mensaje", exception.getMessage()));
    }

    @ExceptionHandler(ReglaNegocioException.class)
    public ResponseEntity<Map<String, String>> manejarReglaNegocio(ReglaNegocioException exception) {
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(Map.of("mensaje", exception.getMessage()));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> manejarRuntime(RuntimeException exception) {
        if (exception.getMessage() != null) {
            String mensaje = exception.getMessage().toLowerCase(java.util.Locale.ROOT);
            if (mensaje.contains("no encontrado") || mensaje.contains("no encontrada"))
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("mensaje", exception.getMessage()));
        }
        return errorInterno();
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> manejarExcepcion(Exception exception) {
        return errorInterno();
    }

    private ResponseEntity<Map<String, String>> errorInterno() {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("mensaje", "Error interno del servidor"));
    }
}
