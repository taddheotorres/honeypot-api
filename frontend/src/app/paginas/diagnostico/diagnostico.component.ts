import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AtaqueService } from '../../servicios/ataque.service';

@Component({
  selector: 'app-diagnostico',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink],
  template: `
    <div class="diag">
      <header class="topbar">
        <div class="topbar-left">
          <h1 class="logo">HONEYPOT::DIAGNOSTICO</h1>
          <a routerLink="/dashboard" class="nav-link">&larr; dashboard</a>
        </div>
        <div class="topbar-right">
          <span class="stat-item">ultima actualizacion: <strong>{{ ultimaActualizacion }}</strong></span>
          <button (click)="refrescar()" class="btn-refresh">REFRESCAR</button>
        </div>
      </header>

      <div *ngIf="error" class="error-bar">{{ error }}</div>

      <!-- Stats principales -->
      <section class="stats-grid">
        <div class="stat-card">
          <div class="stat-led" [class.led-green]="salud?.status === 'UP'" [class.led-red]="salud?.status !== 'UP'"></div>
          <div class="stat-body">
            <span class="stat-val">{{ salud?.status || '...' }}</span>
            <span class="stat-lbl">API Health</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-body">
            <span class="stat-val">{{ totalAtaques }}</span>
            <span class="stat-lbl">Ataques totales</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-body">
            <span class="stat-val">{{ endpoints.filter(e => e.ok).length }}/{{ endpoints.length }}</span>
            <span class="stat-lbl">Endpoints OK</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-body">
            <span class="stat-val" [class.text-green]="!error" [class.text-red]="error">{{ error ? 'ERROR' : 'OK' }}</span>
            <span class="stat-lbl">Sistema</span>
          </div>
        </div>
      </section>

      <!-- Tabla de health checks -->
      <section class="health-section">
        <h3 class="section-title">ENDPOINT HEALTH</h3>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Endpoint</th>
                <th>Metodo</th>
                <th>Status</th>
                <th>Codigo</th>
                <th>Tiempo</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let e of endpoints" class="row-check">
                <td class="td-path">{{ e.path }}</td>
                <td class="td-method">{{ e.metodo }}</td>
                <td>
                  <span class="status-badge" [class.ok]="e.ok" [class.fail]="!e.ok">
                    {{ e.ok ? 'ONLINE' : 'OFFLINE' }}
                  </span>
                </td>
                <td class="td-code" [class.text-green]="e.ok" [class.text-red]="!e.ok">{{ e.code || '--' }}</td>
                <td class="td-time">{{ e.tiempo || '--' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .diag {
      min-height: 100vh;
      background: #05050a;
      color: #c0caf5;
      font-family: 'JetBrains Mono', 'Courier New', monospace;
      padding: 1rem;
    }
    .topbar {
      display: flex; align-items: center; justify-content: space-between;
      background: #0a0a14; border: 1px solid #1a1a2e; border-radius: 6px; padding: 0.6rem 1rem; margin-bottom: 1rem;
    }
    .topbar-left { display: flex; align-items: center; gap: 1rem; }
    .logo {
      font-size: 1rem; font-weight: 700; letter-spacing: 3px; color: #7aa2f7;
      text-shadow: 0 0 6px rgba(122,162,247,0.2); margin: 0;
    }
    .nav-link { color: #3b4261; font-size: 0.7rem; text-decoration: none; letter-spacing: 1px; }
    .nav-link:hover { color: #c0caf5; }
    .topbar-right { display: flex; align-items: center; gap: 1rem; }
    .stat-item { font-size: 0.65rem; color: #3b4261; }
    .stat-item strong { color: #565f89; }
    .btn-refresh {
      background: transparent; border: 1px solid #1a1a2e; color: #565f89;
      font-family: inherit; font-size: 0.6rem; padding: 0.3rem 0.6rem; border-radius: 3px;
      cursor: pointer; letter-spacing: 2px;
    }
    .btn-refresh:hover { border-color: #7aa2f7; color: #7aa2f7; }
    .error-bar {
      background: #1a0a0a; border: 1px solid #ff0040; color: #ff0040;
      padding: 0.5rem 1rem; border-radius: 4px; font-size: 0.78rem; margin-bottom: 1rem;
    }

    .stats-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.8rem; margin-bottom: 1rem;
    }
    .stat-card {
      background: #0a0a14; border: 1px solid #1a1a2e; border-radius: 6px; padding: 1rem;
      display: flex; align-items: center; gap: 0.8rem;
    }
    .stat-led {
      width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
      animation: pulse-led 2s infinite;
    }
    .stat-body { display: flex; flex-direction: column; }
    .stat-val { font-size: 1.3rem; font-weight: 700; color: #c0caf5; }
    .stat-lbl { font-size: 0.6rem; color: #3b4261; letter-spacing: 1px; }
    .text-green { color: #00ff41; }
    .text-red { color: #ff0040; }

    .health-section {
      background: #0a0a14; border: 1px solid #1a1a2e; border-radius: 6px; padding: 0.8rem;
    }
    .section-title {
      font-size: 0.7rem; letter-spacing: 3px; color: #3b4261; margin: 0 0 0.6rem 0; font-weight: 600;
    }
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 0.72rem; }
    th {
      text-align: left; padding: 0.5rem 0.6rem; background: #05050a; color: #3b4261;
      letter-spacing: 1px; font-size: 0.6rem; border-bottom: 1px solid #12121e;
    }
    td { padding: 0.5rem 0.6rem; border-bottom: 1px solid #0d0d18; }
    .row-check:hover { background: rgba(255,255,255,0.02); }
    .td-path { color: #565f89; font-family: 'Courier New', monospace; font-size: 0.68rem; }
    .td-method { color: #3b4261; }
    .td-code { font-weight: 600; }
    .td-time { color: #3b4261; font-size: 0.65rem; }
    .status-badge {
      font-size: 0.55rem; letter-spacing: 2px; padding: 2px 6px; border-radius: 2px; font-weight: 700;
    }
    .status-badge.ok { background: #0a1a0a; color: #00ff41; border: 1px solid #00ff41; }
    .status-badge.fail { background: #1a0a0a; color: #ff0040; border: 1px solid #ff0040; }

    @keyframes pulse-led {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
  `]
})
export class DiagnosticoComponent implements OnInit {
  salud: any = null;
  totalAtaques = 0;
  error: string | null = null;
  ultimaActualizacion = '';
  endpoints = [
    { path: '/actuator/health', metodo: 'GET', ok: false, code: null as number | null, tiempo: null as string | null },
    { path: '/api/ataques', metodo: 'GET', ok: false, code: null as number | null, tiempo: null as string | null },
    { path: '/api/ataques/estadisticas', metodo: 'GET', ok: false, code: null as number | null, tiempo: null as string | null },
    { path: '/api/simular?tipo=test', metodo: 'POST', ok: false, code: null as number | null, tiempo: null as string | null },
  ];

  constructor(private api: AtaqueService) {}

  ngOnInit() {
    this.refrescar();
  }

  refrescar() {
    this.verificarEndpoint(0);
    this.verificarEndpoint(1);
    this.verificarEndpoint(2);
    this.verificarEndpoint(3);
    this.api.listar().subscribe({
      next: a => { this.totalAtaques = a.length; },
      error: () => {}
    });
  }

  async verificarEndpoint(idx: number) {
    const e = this.endpoints[idx];
    const inicio = performance.now();
    try {
      const res = await fetch(e.path, { method: e.metodo });
      e.code = res.status;
      e.ok = res.ok;
      if (e.path === '/actuator/health' && res.ok) {
        this.salud = await res.json();
      }
    } catch {
      e.ok = false;
      e.code = null;
    }
    e.tiempo = (performance.now() - inicio).toFixed(0) + 'ms';
    this.ultimaActualizacion = new Date().toLocaleTimeString();
  }
}
