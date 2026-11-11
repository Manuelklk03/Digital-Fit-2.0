import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../i18n/i18n.service';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './footer.css',
})
export class Footer {
  protected readonly i18n = inject(I18nService);
  protected readonly anio = new Date().getFullYear();
  protected readonly urlCodigo = 'https://github.com/Manuelklk03/Digital-Fit-2.0';
  protected readonly urlLicenciaMapa = 'https://www.openstreetmap.org/copyright';
}
