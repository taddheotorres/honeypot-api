import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deberia crearse', () => {
    expect(component).toBeTruthy();
  });

  it('deberia tener estadisticas por defecto', () => {
    expect(component.estadisticas.total).toBe(0);
  });

  it('deberia iniciar con lista vacia de ataques', () => {
    expect(component.ataques.length).toBe(0);
  });

  it('severidadClase deberia mapear correctamente', () => {
    expect(component.severidadClase('BAJA')).toBe('baja');
    expect(component.severidadClase('MEDIA')).toBe('media');
    expect(component.severidadClase('ALTA')).toBe('alta');
    expect(component.severidadClase('CRITICA')).toBe('critica');
    expect(component.severidadClase('INVALIDA')).toBe('');
  });

  it('tipoEtiqueta deberia mapear correctamente', () => {
    expect(component.tipoEtiqueta('BRUTE_FORCE')).toBe('Fuerza Bruta');
    expect(component.tipoEtiqueta('SQL_INJECTION')).toBe('SQL Injection');
    expect(component.tipoEtiqueta('XSS')).toBe('XSS');
    expect(component.tipoEtiqueta('NO_AUTH')).toBe('Sin Auth');
    expect(component.tipoEtiqueta('OTRO')).toBe('Otro');
    expect(component.tipoEtiqueta('UNKNOWN')).toBe('UNKNOWN');
  });
});
