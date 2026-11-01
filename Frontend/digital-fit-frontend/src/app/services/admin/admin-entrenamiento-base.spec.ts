import { TestBed } from '@angular/core/testing';

import { AdminEntrenamientosBaseService } from './admin-entrenamiento-base';

describe('AdminEntrenamientosBaseService', () => {
  let service: AdminEntrenamientosBaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminEntrenamientosBaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
