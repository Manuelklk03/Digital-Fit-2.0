import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { DetalleEntrenamientoComunidadComponent } from './detalle-entrenamiento-comunidad';

describe('DetalleEntrenamientoComunidad', () => {
  let component: DetalleEntrenamientoComunidadComponent;
  let fixture: ComponentFixture<DetalleEntrenamientoComunidadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleEntrenamientoComunidadComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalleEntrenamientoComunidadComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
