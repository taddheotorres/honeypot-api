import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ataque } from '../modelos/ataque.model';

@Injectable({ providedIn: 'root' })
export class AtaqueService {
  private api = '/api';

  constructor(private http: HttpClient) {}

  listar(): Observable<Ataque[]> {
    return this.http.get<Ataque[]>(`${this.api}/ataques`);
  }

  estadisticas(): Observable<any> {
    return this.http.get(`${this.api}/ataques/estadisticas`);
  }

  simular(tipo: string): Observable<any> {
    return this.http.post(`${this.api}/simular`, null, { params: { tipo } });
  }
}
