import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { MisCentrosComponent } from './mis-centros';

describe('MisCentros', () => {
  let component: MisCentrosComponent;
  let fixture: ComponentFixture<MisCentrosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisCentrosComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(MisCentrosComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
