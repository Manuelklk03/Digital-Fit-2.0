import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { CrearAdminComponent } from './crear-admin';

describe('CrearAdminComponent', () => {
  let component: CrearAdminComponent;
  let fixture: ComponentFixture<CrearAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearAdminComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(CrearAdminComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
