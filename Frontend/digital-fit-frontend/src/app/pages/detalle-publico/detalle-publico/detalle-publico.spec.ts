import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { DetallePublicoComponent } from './detalle-publico';

describe('DetallePublicoComponent', () => {
  let component: DetallePublicoComponent;
  let fixture: ComponentFixture<DetallePublicoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetallePublicoComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(DetallePublicoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
