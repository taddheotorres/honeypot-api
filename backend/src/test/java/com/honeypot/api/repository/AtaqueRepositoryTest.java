package com.honeypot.api.repository;

import com.honeypot.api.model.Ataque;
import com.honeypot.api.model.Severidad;
import com.honeypot.api.model.TipoAtaque;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class AtaqueRepositoryTest {

  @Autowired
  private AtaqueRepository repositorio;

  @BeforeEach
  void setUp() {
    var a1 = new Ataque("192.168.1.1", "/api/iniciar-sesion", "usuario=admin",
        TipoAtaque.BRUTE_FORCE, Severidad.ALTA, "curl/7.68", null);
    var a2 = new Ataque("10.0.0.1", "/api/productos", "id=1' OR '1'='1",
        TipoAtaque.SQL_INJECTION, Severidad.CRITICA, "Mozilla/5.0", null);
    var a3 = new Ataque("192.168.1.1", "/api/buscar", "q=<script>",
        TipoAtaque.XSS, Severidad.ALTA, "curl/7.68", null);
    repositorio.save(a1);
    repositorio.save(a2);
    repositorio.save(a3);
  }

  @Test
  void findAllByOrderByTimestampDesc_deberiaRetornarOrdenado() {
    var resultados = repositorio.findAllByOrderByTimestampDesc();
    assertEquals(3, resultados.size());
    for (int i = 1; i < resultados.size(); i++) {
      assertTrue(
          resultados.get(i - 1).getTimestamp().compareTo(resultados.get(i).getTimestamp()) >= 0
      );
    }
  }

  @Test
  void findByTipo_deberiaFiltrar() {
    var sqlInjections = repositorio.findByTipo(TipoAtaque.SQL_INJECTION);
    assertEquals(1, sqlInjections.size());
    assertEquals("/api/productos", sqlInjections.getFirst().getEndpoint());
  }

  @Test
  void count_deberiaContarTodos() {
    assertEquals(3, repositorio.count());
  }

  @Test
  void contarPorTipo_deberiaAgrupar() {
    var resultados = repositorio.contarPorTipo();
    assertFalse(resultados.isEmpty());
    var mapa = resultados.stream()
        .collect(java.util.stream.Collectors.toMap(
            r -> (TipoAtaque) ((Object[]) r)[0],
            r -> (Long) ((Object[]) r)[1]));
    assertEquals(1L, mapa.get(TipoAtaque.BRUTE_FORCE));
    assertEquals(1L, mapa.get(TipoAtaque.SQL_INJECTION));
    assertEquals(1L, mapa.get(TipoAtaque.XSS));
  }

  @Test
  void contarPorIp_deberiaAgrupar() {
    var resultados = repositorio.contarPorIp();
    assertEquals(2, resultados.size());
    var mapa = resultados.stream()
        .collect(java.util.stream.Collectors.toMap(
            r -> (String) ((Object[]) r)[0],
            r -> (Long) ((Object[]) r)[1]));
    assertEquals(2L, mapa.get("192.168.1.1"));
    assertEquals(1L, mapa.get("10.0.0.1"));
  }

  @Test
  void contarPorEndpoint_deberiaAgrupar() {
    var resultados = repositorio.contarPorEndpoint();
    assertEquals(3, resultados.size());
  }
}
