package com.powerfitgym.backend;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Disabled;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@Disabled("Requiere el contexto completo y la BD configurada; las pruebas unitarias no deben conectar a la BD remota.")
class BackendApplicationTests {

	@Test
	void contextLoads() {
	}

}
