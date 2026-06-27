import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AtaqueService } from '../../servicios/ataque.service';
import { WebSocketService } from '../../servicios/websocket.service';
import { Ataque } from '../../modelos/ataque.model';
import { Subscription } from 'rxjs';

interface Servidor {
  id: string;
  nombre: string;
  endpoint: string;
  tipo: string;
  ip: string;
  ataques: number;
  ultimoAtaque: Ataque | null;
  estado: 'SEGURO' | 'ATENCION' | 'COMPROMETIDO';
  parpadeando: boolean;
}

const SERVIDORES: Servidor[] = [
  { id: 'login', nombre: 'Autenticacion', endpoint: '/api/iniciar-sesion', tipo: 'BRUTE_FORCE', ip: '10.0.0.1', ataques: 0, ultimoAtaque: null, estado: 'SEGURO', parpadeando: false },
  { id: 'productos', nombre: 'Base Datos', endpoint: '/api/productos', tipo: 'SQL_INJECTION', ip: '10.0.0.2', ataques: 0, ultimoAtaque: null, estado: 'SEGURO', parpadeando: false },
  { id: 'buscar', nombre: 'Buscador', endpoint: '/api/buscar', tipo: 'XSS', ip: '10.0.0.3', ataques: 0, ultimoAtaque: null, estado: 'SEGURO', parpadeando: false },
  { id: 'usuarios', nombre: 'API Usuarios', endpoint: '/api/usuarios', tipo: 'NO_AUTH', ip: '10.0.0.4', ataques: 0, ultimoAtaque: null, estado: 'SEGURO', parpadeando: false },
  { id: 'contacto', nombre: 'Contacto', endpoint: '/api/contacto', tipo: 'OTRO', ip: '10.0.0.5', ataques: 0, ultimoAtaque: null, estado: 'SEGURO', parpadeando: false },
];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgIf, NgFor, DatePipe, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  servidores = SERVIDORES.map(s => ({ ...s }));
  ataquesTodos: Ataque[] = [];
  timeline: Ataque[] = [];
  totalAtaques = 0;
  estadoSistema = 'OPERATIVO';
  ultimaActualizacion = '';
  error: string | null = null;
  private subs: Subscription[] = [];

  constructor(
    private ataqueService: AtaqueService,
    private ws: WebSocketService
  ) {}

  ngOnInit() {
    this.cargarHistorial();
    this.cargarEstadisticas();
    this.ws.conectar();

    this.subs.push(
      this.ws.ataqueSubject.subscribe(a => {
        this.procesarAtaque(a);
        this.ataquesTodos.unshift(a);
        this.totalAtaques++;
        this.timeline.unshift(a);
        if (this.timeline.length > 50) this.timeline.pop();
        this.ultimaActualizacion = new Date().toLocaleTimeString();
      })
    );

    this.subs.push(
      this.ws.estadisticasSubject.subscribe(e => {
        if (e?.total) this.totalAtaques = e.total;
      })
    );
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
    this.ws.desconectar();
  }

  procesarAtaque(a: Ataque) {
    const sv = this.servidores.find(s => s.tipo === a.tipo);
    if (!sv) return;
    sv.ataques++;
    sv.ultimoAtaque = a;
    sv.parpadeando = true;
    setTimeout(() => sv.parpadeando = false, 2000);

    if (a.severidad === 'CRITICA' || a.severidad === 'ALTA') {
      sv.estado = 'COMPROMETIDO';
    } else if (a.severidad === 'MEDIA' && sv.estado !== 'COMPROMETIDO') {
      sv.estado = 'ATENCION';
    }

    const comprometidos = this.servidores.filter(s => s.estado === 'COMPROMETIDO').length;
    this.estadoSistema = comprometidos > 0
      ? `COMPROMETIDO (${comprometidos} servidores)`
      : 'OPERATIVO';
  }

  cargarHistorial() {
    this.ataqueService.listar().subscribe({
      next: a => {
        this.ataquesTodos = a;
        this.totalAtaques = a.length;
        this.timeline = a.slice(0, 50);
        a.forEach(at => this.procesarAtaque(at));
      },
      error: e => this.error = 'Error al cargar historial'
    });
  }

  cargarEstadisticas() {
    this.ataqueService.estadisticas().subscribe({
      next: e => {
        if (e?.total) this.totalAtaques = e.total;
      },
      error: () => {}
    });
  }

  simular(tipo: string) {
    this.ataqueService.simular(tipo).subscribe();
  }

  severidadClase(s: string): string {
    const m: Record<string, string> = { BAJA: 'baja', MEDIA: 'media', ALTA: 'alta', CRITICA: 'critica' };
    return m[s] || '';
  }

  tipoEtiqueta(t: string): string {
    const m: Record<string, string> = {
      BRUTE_FORCE: 'Fuerza Bruta',
      SQL_INJECTION: 'SQL Injection',
      XSS: 'XSS',
      NO_AUTH: 'Sin Auth',
      OTRO: 'Otro'
    };
    return m[t] || t;
  }

  contarPorSeveridad(): { baja: number; media: number; alta: number; critica: number } {
    const r = { baja: 0, media: 0, alta: 0, critica: 0 };
    this.ataquesTodos.forEach(a => {
      const s = a.severidad.toLowerCase() as keyof typeof r;
      if (s in r) r[s]++;
    });
    return r;
  }
}
