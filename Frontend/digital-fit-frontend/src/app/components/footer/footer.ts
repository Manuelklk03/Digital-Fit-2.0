import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../i18n/i18n.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './footer.css',
})
export class Footer {
  protected readonly i18n = inject(I18nService);
  private readonly auth = inject(AuthService);
  protected readonly usuario = toSignal(this.auth.usuario$, { initialValue: null });
  protected readonly anio = new Date().getFullYear();
  protected readonly urlCodigo = 'https://github.com/Manuelklk03/Digital-Fit-2.0';
  protected readonly urlLicenciaMapa = 'https://www.openstreetmap.org/copyright';
}
