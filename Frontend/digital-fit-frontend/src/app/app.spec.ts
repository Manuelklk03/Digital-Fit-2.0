import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([{ path: '', children: [] }]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('muestra el esqueleto hasta que termina la primera navegación', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.carga-inicial [df-skeleton]')).not.toBeNull();

    await TestBed.inject(Router).navigateByUrl('/');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.carga-inicial')).toBeNull();
  });
});
