package com.honeypot.api.controller;

import com.honeypot.api.model.Ataque;
import com.honeypot.api.service.AtaqueService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ataques")
public class AtaqueController {

  private final AtaqueService service;

  public AtaqueController(AtaqueService service) {
    this.service = service;
  }

  @GetMapping
  public List<Ataque> listar() {
    return service.listar();
  }

  @GetMapping("/estadisticas")
  public Map<String, Object> estadisticas() {
    return service.obtenerEstadisticas();
  }
}
