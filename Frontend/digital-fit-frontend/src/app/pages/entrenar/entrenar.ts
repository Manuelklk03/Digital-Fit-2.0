import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { I18nService } from '../../i18n/i18n.service';

@Component({
  selector: 'app-entrenar',
  imports: [RouterLink, HeaderComponent, Footer],
  templateUrl: './entrenar.html',
  styleUrl: '../vistas.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntrenarComponent {
  readonly i18n = inject(I18nService);
}
