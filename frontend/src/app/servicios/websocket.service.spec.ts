import { TestBed } from '@angular/core/testing';
import { WebSocketService } from './websocket.service';

describe('WebSocketService', () => {
  let service: WebSocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebSocketService);
  });

  it('deberia crearse', () => {
    expect(service).toBeTruthy();
  });

  it('deberia exponer subjects de ataque y estadisticas', () => {
    expect(service.ataqueSubject).toBeTruthy();
    expect(service.estadisticasSubject).toBeTruthy();
  });

  it('conectar deberia crear un cliente STOMP', () => {
    service.conectar();
    expect((service as any).client).toBeTruthy();
    service.desconectar();
  });
});
