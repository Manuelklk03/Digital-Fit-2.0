import { TestBed } from '@angular/core/testing';

import { EntrenamientosComunidadService } from './entrenamiento-comunidad-service';

describe('EntrenamientosComunidadService', () => {
  let service: EntrenamientosComunidadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EntrenamientosComunidadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
