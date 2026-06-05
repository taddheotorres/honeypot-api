import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Subject } from 'rxjs';
import { Ataque } from '../modelos/ataque.model';

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private client!: Client;
  ataqueSubject = new Subject<Ataque>();
  estadisticasSubject = new Subject<any>();

  conectar() {
    this.client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      onConnect: () => {
        this.client.subscribe('/tema/ataques', (msg: IMessage) => {
          this.ataqueSubject.next(JSON.parse(msg.body));
        });
        this.client.subscribe('/tema/estadisticas', (msg: IMessage) => {
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
