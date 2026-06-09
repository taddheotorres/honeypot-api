package com.honeypot.api.controller;

import com.honeypot.api.service.AtaqueService;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(HoneypotController.class)
class HoneypotControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @MockitoBean
  private AtaqueService service;

  @Test
  void iniciarSesion_deberiaRegistrarBruteForce() throws Exception {
    mockMvc.perform(post("/api/iniciar-sesion")
            .param("usuario", "admin")
            .param("contrasena", "1234"))
        .andExpect(status().isOk())
        .andExpect(content().string("Credenciales inválidas"));

    verify(service).registrar(anyString(), eq("/api/iniciar-sesion"), contains("usuario=admin"),
        eq(com.honeypot.api.model.TipoAtaque.BRUTE_FORCE),
        eq(com.honeypot.api.model.Severidad.ALTA), any());
  }

  @Test
  void productos_conSqlInjection_deberiaRegistrar() throws Exception {
    mockMvc.perform(get("/api/productos").param("id", "1' OR '1'='1"))
        .andExpect(status().isOk())
        .andExpect(content().string("Error en la consulta"));

    verify(service).registrar(anyString(), eq("/api/productos"), contains("1' OR '1'='1"),
        eq(com.honeypot.api.model.TipoAtaque.SQL_INJECTION),
        eq(com.honeypot.api.model.Severidad.CRITICA), any());
  }

  @Test
  void productos_conSqlInjectionConUnion_deberiaRegistrar() throws Exception {
    mockMvc.perform(get("/api/productos").param("id", "1 UNION SELECT * FROM users"))
        .andExpect(status().isOk())
        .andExpect(content().string("Error en la consulta"));

    verify(service).registrar(anyString(), eq("/api/productos"), contains("UNION"),
        eq(com.honeypot.api.model.TipoAtaque.SQL_INJECTION),
        eq(com.honeypot.api.model.Severidad.CRITICA), any());
  }

  @Test
  void productos_sinSqlInjection_noDeberiaRegistrar() throws Exception {
    mockMvc.perform(get("/api/productos").param("id", "42"))
        .andExpect(status().isOk())
        .andExpect(content().json("[{\"id\":1,\"nombre\":\"Producto de prueba\"}]"));

    verify(service, never()).registrar(anyString(), anyString(), anyString(), any(), any(), any());
  }

  @Test
  void buscar_conXss_deberiaRegistrar() throws Exception {
    mockMvc.perform(get("/api/buscar").param("q", "<script>alert('xss')</script>"))
        .andExpect(status().isOk())
        .andExpect(content().string("Búsqueda completada"));

    verify(service).registrar(anyString(), eq("/api/buscar"), contains("<script"),
        eq(com.honeypot.api.model.TipoAtaque.XSS),
        eq(com.honeypot.api.model.Severidad.ALTA), any());
  }

  @Test
  void buscar_conOnerror_deberiaRegistrar() throws Exception {
    mockMvc.perform(get("/api/buscar").param("q", "<img src=x onerror=alert(1)>"))
        .andExpect(status().isOk());

    verify(service).registrar(anyString(), eq("/api/buscar"), contains("onerror"),
        eq(com.honeypot.api.model.TipoAtaque.XSS),
        eq(com.honeypot.api.model.Severidad.ALTA), any());
  }

  @Test
  void buscar_sinXss_noDeberiaRegistrar() throws Exception {
    mockMvc.perform(get("/api/buscar").param("q", "producto normal"))
        .andExpect(status().isOk())
        .andExpect(content().string("[]"));

    verify(service, never()).registrar(anyString(), anyString(), anyString(), any(), any(), any());
  }

  @Test
  void usuarios_deberiaRegistrarNoAuth() throws Exception {
    mockMvc.perform(get("/api/usuarios"))
        .andExpect(status().isOk())
        .andExpect(content().json("{\"error\":\"No autorizado\"}"));

    verify(service).registrar(anyString(), eq("/api/usuarios"), anyString(),
        eq(com.honeypot.api.model.TipoAtaque.NO_AUTH),
        eq(com.honeypot.api.model.Severidad.MEDIA), any());
  }

  @Test
  void contacto_deberiaRegistrarOtro() throws Exception {
    mockMvc.perform(post("/api/contacto")
            .content("{\"mensaje\":\"test\"}"))
        .andExpect(status().isOk())
        .andExpect(content().string("Mensaje recibido"));

    verify(service).registrar(anyString(), eq("/api/contacto"), anyString(),
        eq(com.honeypot.api.model.TipoAtaque.OTRO),
        eq(com.honeypot.api.model.Severidad.BAJA), any());
  }

  @Test
  void simular_deberiaRegistrarAtaqueSimulado() throws Exception {
    mockMvc.perform(post("/api/simular").param("tipo", "sql"))
        .andExpect(status().isOk())
        .andExpect(content().string("Ataque simulado: sql"));

    verify(service).registrar(anyString(), eq("/api/productos"), anyString(),
        eq(com.honeypot.api.model.TipoAtaque.SQL_INJECTION),
        eq(com.honeypot.api.model.Severidad.CRITICA), any());
  }

  @Test
  void simular_xss_deberiaRegistrar() throws Exception {
    mockMvc.perform(post("/api/simular").param("tipo", "xss"))
        .andExpect(status().isOk())
        .andExpect(content().string("Ataque simulado: xss"));

    verify(service).registrar(anyString(), eq("/api/buscar"), anyString(),
        eq(com.honeypot.api.model.TipoAtaque.XSS),
        eq(com.honeypot.api.model.Severidad.ALTA), any());
  }

  @Test
  void simular_brute_deberiaRegistrar() throws Exception {
    mockMvc.perform(post("/api/simular").param("tipo", "brute"))
        .andExpect(status().isOk());

    verify(service).registrar(anyString(), eq("/api/iniciar-sesion"), anyString(),
        eq(com.honeypot.api.model.TipoAtaque.BRUTE_FORCE),
        eq(com.honeypot.api.model.Severidad.ALTA), any());
  }

  @Test
  void simular_noauth_deberiaRegistrar() throws Exception {
    mockMvc.perform(post("/api/simular").param("tipo", "noauth"))
        .andExpect(status().isOk());

    verify(service).registrar(anyString(), eq("/api/usuarios"), anyString(),
        eq(com.honeypot.api.model.TipoAtaque.NO_AUTH),
        eq(com.honeypot.api.model.Severidad.MEDIA), any());
  }
}
