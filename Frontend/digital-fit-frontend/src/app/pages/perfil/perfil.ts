import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Detalle } from '../../compartido/estado';
import { HeaderComponent } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { I18nService } from '../../i18n/i18n.service';
import { Idioma } from '../../i18n/i18n.types';
import { UsuarioSesion } from '../../models/entrenamiento';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-perfil',
  imports: [HeaderComponent, Footer],
  templateUrl: './perfil.html',
  styleUrl: '../vistas.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PerfilComponent implements OnInit {
  readonly i18n = inject(I18nService);
  private readonly auth = inject(AuthService);
  readonly cuenta = new Detalle<UsuarioSesion>(() => this.auth.me());

  ngOnInit(): void {
    this.cuenta.cargar();
  }

  cambiarIdioma(idioma: Idioma): void {
    this.i18n.cambiarIdioma(idioma);
  }
}
