import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { DetalleMiLugarComponent } from './detalle-mi-lugar';

describe('DetalleMiLugarComponent', () => {
  let component: DetalleMiLugarComponent;
  let fixture: ComponentFixture<DetalleMiLugarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleMiLugarComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalleMiLugarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
