import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { DetalleMiCentroComponent } from './detalle-mi-centro';

describe('DetalleMiCentroComponent', () => {
  let component: DetalleMiCentroComponent;
  let fixture: ComponentFixture<DetalleMiCentroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleMiCentroComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalleMiCentroComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
