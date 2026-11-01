import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { SoporteComponent } from './soporte';

describe('Soporte', () => {
  let component: SoporteComponent;
  let fixture: ComponentFixture<SoporteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SoporteComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(SoporteComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
