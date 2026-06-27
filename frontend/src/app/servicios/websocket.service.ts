import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Ataque } from '../modelos/ataque.model';

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private client: any;
  ataqueSubject = new Subject<Ataque>();
  estadisticasSubject = new Subject<any>();

  async conectar() {
    const [{ Client }, SockJS] = await Promise.all([
      import('@stomp/stompjs'),
      import('sockjs-client').then(m => m.default || m)
    ]);
    this.client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      onConnect: () => {
        this.client.subscribe('/tema/ataques', (msg: any) => {
          this.ataqueSubject.next(JSON.parse(msg.body));
        });
        this.client.subscribe('/tema/estadisticas', (msg: any) => {
          this.estadisticasSubject.next(JSON.parse(msg.body));
        });
      }
    });
    this.client.activate();
  }

  desconectar() {
    if (this.client) this.client.deactivate();
  }
}
