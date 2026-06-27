import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AtaqueService } from '../../servicios/ataque.service';

@Component({
  selector: 'app-diagnostico',
  standalone: true,
  imports: [NgIf, NgFor, DatePipe, RouterLink],
  template: `
    <div class="contenedor">
      <header>
        <h1>Diagnostico</h1>
        <p class="sub"><a routerLink="/dashboard" style="color:#89b4fa">&larr; Volver al dashboard</a></p>
      </header>

      <section class="tarjetas">
        <div class="tarjeta total">
          <span class="numero">{{ salud?.status || '?' }}</span>
          <span class="etiqueta">API Status</span>
        </div>
        <div class="tarjeta ip">
          <span class="numero">{{ totalAtaques }}</span>
          <span class="etiqueta">Ataques registrados</span>
        </div>
        <div class="tarjeta endpoint">
          <span class="numero">{{ error ? 'Error' : 'OK' }}</span>
          <span class="etiqueta">Ultima consulta</span>
        </div>
      </section>

      <div *ngIf="error" style="background:#1e1e2e;border:2px solid #f38ba8;color:#f38ba8;padding:1rem;margin:1rem 0;border-radius:8px">
        <strong>Error:</strong> {{ error }}
      </div>

      <section class="endpoints" *ngIf="!error">
        <h3>Endpoint Health</h3>
        <div class="tabla-wrapper">
          <table>
            <thead>
              <tr>
                <th>Endpoint</th>
                <th>Metodo</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let e of endpoints">
                <td>{{ e.path }}</td>
                <td>{{ e.metodo }}</td>
                <td><span class="badge" [class]="e.ok ? 'baja' : 'critica'">{{ e.ok ? 'OK' : 'Fallo' }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .contenedor { max-width: 1280px; margin: 0 auto; padding: 2rem 1.5rem; }
    header { margin-bottom: 2rem; text-align: center; }
    header h1 { font-size: 2.2rem; color: #89b4fa; letter-spacing: 2px; }
    header .sub { color: #6c7086; font-size: 0.9rem; }
    .tarjetas {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .tarjeta {
      background: #11111b;
      border: 1px solid #313244;
      border-radius: 10px;
      padding: 1.5rem;
      text-align: center;
    }
    .tarjeta .numero { font-size: 2.4rem; font-weight: 700; display: block; }
    .tarjeta .etiqueta { color: #6c7086; font-size: .8rem; text-transform: uppercase; letter-spacing: 1px; }
    .tarjeta.total .numero { color: #89b4fa; }
    .tarjeta.ip .numero { color: #a6e3a1; }
    .tarjeta.endpoint .numero { color: #f9e2af; }
    .endpoints h3 { margin-bottom: 1rem; color: #bac2de; }
    .tabla-wrapper {
      overflow-x: auto;
      border: 1px solid #313244;
      border-radius: 8px;
      background: #11111b;
    }
    table { width: 100%; border-collapse: collapse; font-size: .82rem; }
    th {
      text-align: left;
      padding: .7rem .8rem;
      background: #181825;
      color: #6c7086;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-size: .7rem;
      border-bottom: 1px solid #313244;
    }
    td { padding: .6rem .8rem; border-bottom: 1px solid #232434; }
    .badge { font-size: .7rem; padding: 2px 7px; border-radius: 3px; font-weight: 600; }
    .badge.baja { color: #a6e3a1; background: #1a2e1a; }
    .badge.critica { color: #f38ba8; background: #2e1a1a; }
  `]
})
export class DiagnosticoComponent implements OnInit {
  salud: any = null;
  totalAtaques = 0;
  error: string | null = null;
  endpoints = [
    { path: '/api/ataques', metodo: 'GET', ok: false },
    { path: '/api/ataques/estadisticas', metodo: 'GET', ok: false },
    { path: '/actuator/health', metodo: 'GET', ok: false },
  ];

  constructor(private api: AtaqueService) {}

  ngOnInit() {
    this.verificarEndpoint('/actuator/health', 'GET', 0);
    this.api.listar().subscribe({
      next: a => { this.totalAtaques = a.length; this.endpoints[1].ok = true; },
      error: () => this.endpoints[1].ok = false
    });
    fetch('/api/ataques/estadisticas').then(r => {
      if (r.ok) this.endpoints[2].ok = true;
    }).catch(() => {});
  }

  verificarEndpoint(path: string, metodo: string, idx: number) {
    fetch(path, { method: metodo })
      .then(r => {
        this.endpoints[idx].ok = r.ok;
        if (path === '/actuator/health') return r.json();
        return null;
      })
      .then(d => { if (d) this.salud = d; })
      .catch(() => this.endpoints[idx].ok = false);
  }
}
