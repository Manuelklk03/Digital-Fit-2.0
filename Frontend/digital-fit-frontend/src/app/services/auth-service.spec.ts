import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { AuthService } from './auth-service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

describe('AuthService al prerenderizar', () => {
  it('me() falla sin llamar a la API cuando no se ejecuta en el navegador', () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    });
    const http = TestBed.inject(HttpTestingController);
    let fallo = false;

    TestBed.inject(AuthService)
      .me()
      .subscribe({ error: () => (fallo = true) });

    expect(fallo).toBe(true);
    http.expectNone('/api/auth/me');
  });
});
