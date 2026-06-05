package com.honeypot.api.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ataques")
public class Ataque {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String ip;

  @Column(nullable = false)
  private String endpoint;

  @Column(length = 1024)
  private String payload;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private TipoAtaque tipo;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private Severidad severidad;

  @Column(nullable = false)
  private LocalDateTime timestamp;

  @Column(length = 512)
  private String userAgent;

  @Column(columnDefinition = "TEXT")
  private String detalles;

  public Ataque() {}

  public Ataque(String ip, String endpoint, String payload, TipoAtaque tipo, Severidad severidad, String userAgent, String detalles) {
    this.ip = ip;
    this.endpoint = endpoint;
    this.payload = payload;
    this.tipo = tipo;
    this.severidad = severidad;
    this.timestamp = LocalDateTime.now();
    this.userAgent = userAgent;
    this.detalles = detalles;
  }

  public Long getId() { return id; }
  public String getIp() { return ip; }
  public String getEndpoint() { return endpoint; }
  public String getPayload() { return payload; }
  public TipoAtaque getTipo() { return tipo; }
  public Severidad getSeveridad() { return severidad; }
  public LocalDateTime getTimestamp() { return timestamp; }
  public String getUserAgent() { return userAgent; }
  public String getDetalles() { return detalles; }

  public void setId(Long id) { this.id = id; }
  public void setIp(String ip) { this.ip = ip; }
  public void setEndpoint(String endpoint) { this.endpoint = endpoint; }
  public void setPayload(String payload) { this.payload = payload; }
  public void setTipo(TipoAtaque tipo) { this.tipo = tipo; }
  public void setSeveridad(Severidad severidad) { this.severidad = severidad; }
  public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
  public void setUserAgent(String userAgent) { this.userAgent = userAgent; }
  public void setDetalles(String detalles) { this.detalles = detalles; }
}
