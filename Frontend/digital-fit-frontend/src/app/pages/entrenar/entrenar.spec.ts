import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { EntrenarComponent } from './entrenar';

describe('EntrenarComponent', () => {
  beforeEach(async () => {
    localStorage.removeItem('digitalfit_lang');
    await TestBed.configureTestingModule({
      imports: [EntrenarComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  afterEach(() => localStorage.removeItem('digitalfit_lang'));

  it('enlaza a los tres catálogos reales sin mostrar una sesión ficticia', () => {
    const fixture = TestBed.createComponent(EntrenarComponent);
    fixture.detectChanges();
    TestBed.inject(HttpTestingController)
      .expectOne('/api/auth/me')
      .flush(null, { status: 401, statusText: 'Unauthorized' });
    const main = fixture.nativeElement.querySelector('main') as HTMLElement;
    const rutas = Array.from(main.querySelectorAll('a')).map((a) => a.getAttribute('href'));
    expect(rutas).toEqual(['/entrenamientos', '/mis-entrenamientos', '/entrenamientos-comunidad']);
    expect(main.textContent).not.toContain('EN VIVO');
    TestBed.inject(HttpTestingController).verify();
  });
});
