import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { MisLugaresComponent } from './mis-lugares';

describe('MisLugaresComponent', () => {
  let component: MisLugaresComponent;
  let fixture: ComponentFixture<MisLugaresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisLugaresComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(MisLugaresComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
