import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { ValoracionesComponent } from './valoraciones';

describe('Valoraciones', () => {
  let component: ValoracionesComponent;
  let fixture: ComponentFixture<ValoracionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValoracionesComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ValoracionesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
