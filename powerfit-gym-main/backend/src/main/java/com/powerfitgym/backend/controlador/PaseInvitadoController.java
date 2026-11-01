package com.powerfitgym.backend.controlador;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/pases_invitado")
@CrossOrigin(origins = "*")
public class PaseInvitadoController {

    @GetMapping
    public ResponseEntity<List<?>> listar() {
        return ResponseEntity.ok(Collections.emptyList());
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Object pase) {
        return new ResponseEntity<>(pase, HttpStatus.CREATED);
    }
}