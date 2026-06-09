package com.honeypot.api.controller;

import com.honeypot.api.model.Ataque;
import com.honeypot.api.model.Severidad;
import com.honeypot.api.model.TipoAtaque;
import com.honeypot.api.service.AtaqueService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AtaqueController.class)
class AtaqueControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @MockitoBean
  private AtaqueService service;

  @Test
  void listar_deberiaRetornarLista() throws Exception {
    var ataque = new Ataque("10.0.0.1", "/api/usuarios", "GET sin token",
        TipoAtaque.NO_AUTH, Severidad.MEDIA, "Mozilla/5.0", null);
    when(service.listar()).thenReturn(List.of(ataque));

    mockMvc.perform(get("/api/ataques"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].ip").value("10.0.0.1"))
        .andExpect(jsonPath("$[0].tipo").value("NO_AUTH"));
  }

  @Test
  void estadisticas_deberiaRetornarMapa() throws Exception {
    Map<String, Object> stats = new LinkedHashMap<>();
    stats.put("total", 10L);
    stats.put("porTipo", List.of());
    when(service.obtenerEstadisticas()).thenReturn(stats);

    mockMvc.perform(get("/api/ataques/estadisticas"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.total").value(10));
  }
}
