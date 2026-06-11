package com.honeypot.api.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class RateLimitingFilterTest {

  @Autowired
  private MockMvc mockMvc;

  @Test
  void rateLimitExcedeDevuelve429() throws Exception {
    String ip = "192.168.1.99";

    for (int i = 0; i < 20; i++) {
      mockMvc.perform(get("/api/usuarios").header("X-Forwarded-For", ip))
        .andExpect(status().isOk());
    }

    mockMvc.perform(get("/api/usuarios").header("X-Forwarded-For", ip))
      .andExpect(status().is(429))
      .andExpect(jsonPath("$.error").value("Demasiadas solicitudes. Intenta de nuevo en 60 segundos."));
  }

  @Test
  void healthEndpointNoTieneRateLimit() throws Exception {
    String ip = "192.168.1.200";

    for (int i = 0; i < 30; i++) {
      mockMvc.perform(get("/actuator/health").header("X-Forwarded-For", ip))
        .andExpect(status().isOk());
    }
  }
}
