import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { PublicosComponent } from './publicos';

describe('Publicos', () => {
  let component: PublicosComponent;
  let fixture: ComponentFixture<PublicosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicosComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(PublicosComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
