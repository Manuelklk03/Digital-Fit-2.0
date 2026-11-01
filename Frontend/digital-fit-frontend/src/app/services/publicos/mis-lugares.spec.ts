import { TestBed } from '@angular/core/testing';

import { MisLugaresService } from './mis-lugares';

describe('MisLugaresService', () => {
  let service: MisLugaresService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MisLugaresService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
