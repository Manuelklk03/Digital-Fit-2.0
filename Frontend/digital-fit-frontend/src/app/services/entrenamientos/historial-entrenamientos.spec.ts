import { TestBed } from '@angular/core/testing';

import { HistorialEntrenamientosService } from './historial-entrenamientos';

describe('HistorialEntrenamientosService', () => {
  let service: HistorialEntrenamientosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HistorialEntrenamientosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
