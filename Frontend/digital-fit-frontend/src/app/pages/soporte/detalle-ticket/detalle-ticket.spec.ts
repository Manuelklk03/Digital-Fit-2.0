import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { DetalleTicketComponent } from './detalle-ticket';

describe('DetalleTicketComponent', () => {
  let component: DetalleTicketComponent;
  let fixture: ComponentFixture<DetalleTicketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleTicketComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalleTicketComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
