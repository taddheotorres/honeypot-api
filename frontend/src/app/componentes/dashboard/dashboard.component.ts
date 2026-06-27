import { Component } from '@angular/core';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { AtaqueService } from '../../servicios/ataque.service';
import { Ataque } from '../../modelos/ataque.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgIf, NgFor, DatePipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  ataques: Ataque[] = [];
  ultimoAtaque: Ataque | null = null;
  estadisticas: any = { total: 0, porTipo: [], porIp: [], porEndpoint: [] };
  error: string | null = null;

  constructor(
    private ataqueService: AtaqueService
  ) {
    this.cargarHistorial();
    this.cargarEstadisticas();
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
