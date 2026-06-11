package com.honeypot.api.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

public class RateLimitingFilter implements Filter {

  private final Map<String, UserRequests> contadores = new ConcurrentHashMap<>();
  private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();
  private final int maxRequests;
  private final int windowSeconds;

  public RateLimitingFilter(int maxRequests, int windowSeconds) {
    this.maxRequests = maxRequests;
    this.windowSeconds = windowSeconds;
    scheduler.scheduleAtFixedRate(this::limpiar, windowSeconds, windowSeconds, TimeUnit.SECONDS);
  }

  @Override
  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
      throws IOException, ServletException {

    HttpServletRequest req = (HttpServletRequest) request;
    String path = req.getRequestURI();

    if (!aplicaRateLimit(path)) {
      chain.doFilter(request, response);
      return;
    }

    String ip = ipReal(req);
    UserRequests user = contadores.computeIfAbsent(ip, k -> new UserRequests());

    int actuales = user.contador.incrementAndGet();
    if (actuales > maxRequests) {
      HttpServletResponse res = (HttpServletResponse) response;
      res.setStatus(429);
      res.setContentType("application/json");
      res.getWriter().write("{\"error\":\"Demasiadas solicitudes. Intenta de nuevo en " + windowSeconds + " segundos.\"}");
      return;
    }

    chain.doFilter(request, response);
  }

  private String ipReal(HttpServletRequest req) {
    String xff = req.getHeader("X-Forwarded-For");
    if (xff != null && !xff.isBlank()) {
      return xff.split(",")[0].trim();
    }
    return req.getRemoteAddr();
  }

  private boolean aplicaRateLimit(String path) {
    return path.startsWith("/api/iniciar-sesion")
      || path.startsWith("/api/productos")
      || path.startsWith("/api/buscar")
      || path.startsWith("/api/usuarios")
      || path.startsWith("/api/contacto")
      || path.startsWith("/api/simular");
  }

  private void limpiar() {
    contadores.clear();
  }

  static class UserRequests {
    final AtomicInteger contador = new AtomicInteger(0);
  }
}
