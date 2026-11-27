import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Detalle } from '../../compartido/estado';
import { HeaderComponent } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { I18nService } from '../../i18n/i18n.service';
import { Idioma } from '../../i18n/i18n.types';
import { UsuarioSesion } from '../../models/entrenamiento';
import { AuthService } from '../../services/auth-service';
import { GuiaInicialService } from '../../services/guia-inicial.service';

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
  private readonly guia = inject(GuiaInicialService);
  private readonly router = inject(Router);
  readonly cuenta = new Detalle<UsuarioSesion>(() => this.auth.me());

  ngOnInit(): void {
    this.cuenta.cargar();
  }

  cambiarIdioma(idioma: Idioma): void {
    this.i18n.cambiarIdioma(idioma);
  }

  recuperarGuia(): void {
    const usuario = this.cuenta.item();
    if (usuario?.rol !== 'USER') return;
    this.guia.establecerVisible(usuario.username, true);
    void this.router.navigate(['/dashboard']);
  }
}
