package com.honeypot.api.service;

import com.honeypot.api.model.Ataque;
import com.honeypot.api.model.Severidad;
import com.honeypot.api.model.TipoAtaque;
import com.honeypot.api.repository.AtaqueRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AtaqueServiceTest {

  @Mock
  private AtaqueRepository repositorio;

  @Mock
  private SimpMessagingTemplate ws;

  private AtaqueService service;

  @BeforeEach
  void setUp() {
    service = new AtaqueService(repositorio, ws);
  }

  @Test
  void registrar_deberiaPersistirYPublicarEnWs() {
    var ataque = new Ataque("192.168.1.1", "/api/productos", "id=1' OR '1'='1",
        TipoAtaque.SQL_INJECTION, Severidad.CRITICA, "curl/7.68", null);
    when(repositorio.save(any())).thenAnswer(i -> {
      var a = i.<Ataque>getArgument(0);
      a.setId(1L);
      return a;
    });
    when(repositorio.count()).thenReturn(1L);
    when(repositorio.contarPorTipo()).thenReturn(List.of());
    when(repositorio.contarPorIp()).thenReturn(List.of());
    when(repositorio.contarPorEndpoint()).thenReturn(List.of());

    var resultado = service.registrar("192.168.1.1", "/api/productos", "id=1' OR '1'='1",
        TipoAtaque.SQL_INJECTION, Severidad.CRITICA, "curl/7.68");

    assertNotNull(resultado);
    assertEquals("192.168.1.1", resultado.getIp());
    assertEquals(TipoAtaque.SQL_INJECTION, resultado.getTipo());
    assertEquals(Severidad.CRITICA, resultado.getSeveridad());

    verify(repositorio).save(any());
    verify(ws, times(2)).convertAndSend(anyString(), any(Object.class));
  }

  @Test
  void listar_deberiaRetornarAtaques() {
    var ataque = new Ataque("10.0.0.1", "/api/usuarios", "GET sin token",
        TipoAtaque.NO_AUTH, Severidad.MEDIA, "Mozilla/5.0", null);
    when(repositorio.findAllByOrderByTimestampDesc()).thenReturn(List.of(ataque));

    var resultado = service.listar();

    assertEquals(1, resultado.size());
    assertEquals("10.0.0.1", resultado.getFirst().getIp());
    verify(repositorio).findAllByOrderByTimestampDesc();
  }

  @Test
  void obtenerEstadisticas_deberiaRetornarMapaCompleto() {
    when(repositorio.count()).thenReturn(5L);
    when(repositorio.contarPorTipo()).thenReturn(List.of());
    when(repositorio.contarPorIp()).thenReturn(List.of());
    when(repositorio.contarPorEndpoint()).thenReturn(List.of());

    var stats = service.obtenerEstadisticas();

    assertEquals(5L, stats.get("total"));
    assertTrue(stats.containsKey("porTipo"));
    assertTrue(stats.containsKey("porIp"));
    assertTrue(stats.containsKey("porEndpoint"));
    verify(repositorio).count();
    verify(repositorio).contarPorTipo();
    verify(repositorio).contarPorIp();
    verify(repositorio).contarPorEndpoint();
  }
}
