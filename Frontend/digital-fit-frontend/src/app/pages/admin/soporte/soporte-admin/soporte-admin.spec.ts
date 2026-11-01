import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { AdminSoporteComponent } from './soporte-admin';

describe('AdminSoporteComponent', () => {
  let component: AdminSoporteComponent;
  let fixture: ComponentFixture<AdminSoporteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminSoporteComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminSoporteComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
