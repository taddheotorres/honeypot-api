package com.honeypot.api.service;

import com.honeypot.api.model.Ataque;
import com.honeypot.api.model.Severidad;
import com.honeypot.api.model.TipoAtaque;
import com.honeypot.api.repository.AtaqueRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class AtaqueService {

  private final AtaqueRepository repositorio;
  private final SimpMessagingTemplate ws;

  public AtaqueService(AtaqueRepository repositorio, SimpMessagingTemplate ws) {
    this.repositorio = repositorio;
    this.ws = ws;
  }

  public Ataque registrar(String ip, String endpoint, String payload, TipoAtaque tipo, Severidad severidad, String userAgent) {
    Ataque a = new Ataque(ip, endpoint, payload, tipo, severidad, userAgent, null);
    a = repositorio.save(a);
    ws.convertAndSend("/tema/ataques", a);
    ws.convertAndSend("/tema/estadisticas", obtenerEstadisticas());
    return a;
  }

  public List<Ataque> listar() {
    return repositorio.findAllByOrderByTimestampDesc();
  }

  public Map<String, Object> obtenerEstadisticas() {
    Map<String, Object> est = new LinkedHashMap<>();
    est.put("total", repositorio.count());
    est.put("porTipo", repositorio.contarPorTipo());
    est.put("porIp", repositorio.contarPorIp());
    est.put("porEndpoint", repositorio.contarPorEndpoint());
    return est;
  }
}
