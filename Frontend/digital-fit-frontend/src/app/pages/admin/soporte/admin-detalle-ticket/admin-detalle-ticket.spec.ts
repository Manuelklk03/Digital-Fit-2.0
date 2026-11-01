import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { AdminDetalleTicketComponent } from './admin-detalle-ticket';

describe('AdminDetalleTicketComponent', () => {
  let component: AdminDetalleTicketComponent;
  let fixture: ComponentFixture<AdminDetalleTicketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDetalleTicketComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDetalleTicketComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
