import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { PrivadosComponent } from './privados';

describe('Privados', () => {
  let component: PrivadosComponent;
  let fixture: ComponentFixture<PrivadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivadosComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(PrivadosComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
