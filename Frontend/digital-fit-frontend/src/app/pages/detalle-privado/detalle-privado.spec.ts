import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { DetallePrivadoComponent } from './detalle-privado';

describe('DetallePrivadoComponent', () => {
  let component: DetallePrivadoComponent;
  let fixture: ComponentFixture<DetallePrivadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetallePrivadoComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(DetallePrivadoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
