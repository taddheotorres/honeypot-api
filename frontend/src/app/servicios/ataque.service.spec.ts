import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AtaqueService } from './ataque.service';

describe('AtaqueService', () => {
  let service: AtaqueService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });
    service = TestBed.inject(AtaqueService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deberia listar ataques', () => {
    const mock = [{ id: 1, ip: '10.0.0.1', endpoint: '/api/test', tipo: 'XSS', severidad: 'ALTA', timestamp: '2026-01-01T00:00:00', payload: '', userAgent: '', detalles: null }];

    service.listar().subscribe(a => {
      expect(a.length).toBe(1);
      expect(a[0].tipo).toBe('XSS');
    });

    const req = httpMock.expectOne('/api/ataques');
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('deberia obtener estadisticas', () => {
    const mock = { total: 5, porTipo: [], porIp: [], porEndpoint: [] };

    service.estadisticas().subscribe(e => {
      expect(e.total).toBe(5);
    });

    const req = httpMock.expectOne('/api/ataques/estadisticas');
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('deberia simular ataque', () => {
    service.simular('sql').subscribe();

    const req = httpMock.expectOne(r => r.url === '/api/simular' && r.params.get('tipo') === 'sql');
    expect(req.request.method).toBe('POST');
    req.flush({});
  });
});
