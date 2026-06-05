package com.honeypot.api.controller;

import com.honeypot.api.model.Severidad;
import com.honeypot.api.model.TipoAtaque;
import com.honeypot.api.service.AtaqueService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class HoneypotController {

  private final AtaqueService service;

  public HoneypotController(AtaqueService service) {
    this.service = service;
  }

  @PostMapping("/iniciar-sesion")
  public String iniciarSesion(@RequestParam(required = false) String usuario,
      @RequestParam(required = false) String contrasena,
      HttpServletRequest req) {
    String ip = req.getRemoteAddr();
    String payload = "usuario=" + usuario + "&contrasena=" + contrasena;
    service.registrar(ip, "/api/iniciar-sesion", payload, TipoAtaque.BRUTE_FORCE, Severidad.ALTA, req.getHeader("User-Agent"));
    return "Credenciales inválidas";
  }

  @GetMapping("/productos")
  public String productos(@RequestParam(required = false) String id, HttpServletRequest req) {
    if (id != null && id.matches(".*['\"].*|.*--.*|.*\\bOR\\b.*|.*\\bUNION\\b.*")) {
      String ip = req.getRemoteAddr();
      service.registrar(ip, "/api/productos", "id=" + id, TipoAtaque.SQL_INJECTION, Severidad.CRITICA, req.getHeader("User-Agent"));
      return "Error en la consulta";
    }
    return "[{\"id\":1,\"nombre\":\"Producto de prueba\"}]";
  }

  @GetMapping("/buscar")
  public String buscar(@RequestParam(required = false) String q, HttpServletRequest req) {
    if (q != null && (q.contains("<script") || q.contains("onerror") || q.contains("onload"))) {
      String ip = req.getRemoteAddr();
      service.registrar(ip, "/api/buscar", "q=" + q, TipoAtaque.XSS, Severidad.ALTA, req.getHeader("User-Agent"));
      return "Búsqueda completada";
    }
    return "[]";
  }

  @GetMapping("/usuarios")
  public String usuarios(HttpServletRequest req) {
    String ip = req.getRemoteAddr();
    service.registrar(ip, "/api/usuarios", "GET /usuarios sin token", TipoAtaque.NO_AUTH, Severidad.MEDIA, req.getHeader("User-Agent"));
    return "{\"error\":\"No autorizado\"}";
  }

  @PostMapping("/contacto")
  public String contacto(@RequestBody(required = false) String cuerpo, HttpServletRequest req) {
    String ip = req.getRemoteAddr();
    service.registrar(ip, "/api/contacto", cuerpo != null ? cuerpo : "vacio", TipoAtaque.OTRO, Severidad.BAJA, req.getHeader("User-Agent"));
    return "Mensaje recibido";
  }

  @PostMapping("/simular")
  public String simular(@RequestParam String tipo, HttpServletRequest req) {
    String ip = req.getRemoteAddr();
    String[] ipsFalsas = {"192.168.1." + (int)(Math.random() * 255), "10.0.0." + (int)(Math.random() * 255), "185.220.101." + (int)(Math.random() * 255)};
    String ipSimulada = ipsFalsas[(int)(Math.random() * ipsFalsas.length)];

    TipoAtaque t;
    Severidad s;
    String endpoint, payload;

    switch (tipo) {
      case "sql" -> {
        t = TipoAtaque.SQL_INJECTION; s = Severidad.CRITICA;
        endpoint = "/api/productos"; payload = "id=1' OR '1'='1";
      }
      case "xss" -> {
        t = TipoAtaque.XSS; s = Severidad.ALTA;
        endpoint = "/api/buscar"; payload = "q=<script>alert('xss')</script>";
      }
      case "brute" -> {
        t = TipoAtaque.BRUTE_FORCE; s = Severidad.ALTA;
        endpoint = "/api/iniciar-sesion"; payload = "usuario=admin&contrasena=1234";
      }
      case "noauth" -> {
        t = TipoAtaque.NO_AUTH; s = Severidad.MEDIA;
        endpoint = "/api/usuarios"; payload = "GET sin token";
      }
      default -> {
        t = TipoAtaque.OTRO; s = Severidad.BAJA;
        endpoint = "/api/contacto"; payload = "datos sospechosos";
      }
    }

    service.registrar(ipSimulada, endpoint, payload, t, s, "Mozilla/5.0 (X11; Linux x86_64)");
    return "Ataque simulado: " + tipo;
  }
}
