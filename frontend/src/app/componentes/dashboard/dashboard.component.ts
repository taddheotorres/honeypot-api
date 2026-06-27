import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AtaqueService } from '../../servicios/ataque.service';
import { WebSocketService } from '../../servicios/websocket.service';
import { Ataque } from '../../modelos/ataque.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  ataques: Ataque[] = [];
  ultimoAtaque: Ataque | null = null;
  estadisticas: any = { total: 0, porTipo: [], porIp: [], porEndpoint: [] };
  error: string | null = null;
  private subs: Subscription[] = [];

  constructor(
    private ataqueService: AtaqueService,
    private ws: WebSocketService
  ) {}

  ngOnInit() {
    try {
      this.cargarHistorial();
      this.cargarEstadisticas();
      this.ws.conectar();

      this.subs.push(
        this.ws.ataqueSubject.subscribe(a => {
          this.ultimoAtaque = a;
          this.ataques.unshift(a);
          if (this.ataques.length > 100) this.ataques.pop();
        })
      );

      this.subs.push(
        this.ws.estadisticasSubject.subscribe(e => this.estadisticas = e)
      );
    } catch (e: any) {
      this.error = e?.message || String(e);
    }
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
    this.ws.desconectar();
  }

  cargarHistorial() {
    this.ataqueService.listar().subscribe({
      next: a => this.ataques = a,
      error: e => this.error = 'Error al cargar historial: ' + e?.message
    });
  }

  cargarEstadisticas() {
    this.ataqueService.estadisticas().subscribe({
      next: e => this.estadisticas = e,
      error: e => this.error = 'Error al cargar estadísticas: ' + e?.message
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
}
