import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { I18nService } from '../../i18n/i18n.service';

@Component({
  selector: 'app-no-encontrado',
  imports: [RouterLink, HeaderComponent, Footer],
  templateUrl: './no-encontrado.html',
  styleUrls: ['../vistas.css', './no-encontrado.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoEncontradoComponent {
  readonly i18n = inject(I18nService);
}
