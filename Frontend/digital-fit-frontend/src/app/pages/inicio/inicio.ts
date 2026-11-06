import {
  ChangeDetectorRef,
  Component,
  inject,
  ChangeDetectionStrategy,
  OnInit,
  AfterViewInit,
  OnDestroy,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { HeaderComponent } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { ButtonComponent, BadgeComponent, CardComponent } from '../../components/ui';
import { AuthService } from '../../services/auth-service';
import { I18nService } from '../../i18n/i18n.service';

export interface UsuarioSesion {
  username: string;
  rol: string;
}

@Component({
  selector: 'app-inicio',
  imports: [HeaderComponent, Footer, RouterLink, ButtonComponent, BadgeComponent, CardComponent],
  templateUrl: './inicio.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './inicio.css',
})
export class InicioComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly platformId = inject(PLATFORM_ID);
  readonly i18n = inject(I18nService);

  readonly usuarioActual = signal<UsuarioSesion | null>(null);
  readonly cargando = signal<boolean>(true);

  // Demostración interactiva del Asistente en Directo (D12 / Neutral Sport)
  readonly serieActual = signal<number>(3);
  readonly serieTotal = 4;
  readonly pesoActual = signal<number>(32.5);
  readonly repsActual = signal<number>(10);
  readonly descansoSegundos = signal<number>(75);
  readonly descansoActivo = signal<boolean>(false);

  private intervaloDescanso: ReturnType<typeof setInterval> | null = null;
  private scrollTriggers: { kill: () => void }[] = [];

  ngOnInit(): void {
    this.authService.usuario$.subscribe((usuario) => {
      if (usuario) {
        this.usuarioActual.set(usuario as UsuarioSesion);
        this.cargando.set(false);
        this.cdr.markForCheck();
      }
    });

    this.authService
      .me()
      .pipe(
        finalize(() => {
          this.cargando.set(false);
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (usuario) => {
          this.usuarioActual.set(usuario as UsuarioSesion);
          this.cdr.markForCheck();
        },
        error: () => {
          // Si no hay sesión iniciada, se muestra la portada pública para visitantes
          this.usuarioActual.set(null);
          this.cdr.markForCheck();
        },
      });
  }

  async ngAfterViewInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    // Condición D15: Respeto estricto a prefers-reduced-motion
    const prefiereMovimientoReducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefiereMovimientoReducido) {
      return;
    }

    try {
      // Carga dinámica de GSAP y ScrollTrigger solo en /inicio para no penalizar el bundle principal (D15)
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      // 1. Animación del Hero al entrar
      if (document.querySelector('.anim-hero-badge')) {
        gsap.from('.anim-hero-badge', {
          opacity: 0,
          y: -15,
          duration: 0.6,
          ease: 'power2.out',
        });
      }

      if (document.querySelector('.anim-hero-title')) {
        gsap.from('.anim-hero-title', {
          opacity: 0,
          y: 25,
          duration: 0.8,
          delay: 0.15,
          ease: 'power3.out',
        });
      }

      if (document.querySelector('.anim-hero-text')) {
        gsap.from('.anim-hero-text', {
          opacity: 0,
          y: 20,
          duration: 0.8,
          delay: 0.3,
          ease: 'power3.out',
        });
      }

      if (document.querySelector('.anim-hero-cta')) {
        gsap.from('.anim-hero-cta', {
          opacity: 0,
          y: 20,
          duration: 0.7,
          delay: 0.45,
          stagger: 0.1,
          ease: 'power3.out',
        });
      }

      // 2. Animaciones guiadas por scroll en cada sección de storytelling
      const secciones = document.querySelectorAll('.anim-scroll-seccion');
      secciones.forEach((seccion) => {
        const trigger = ScrollTrigger.create({
          trigger: seccion,
          start: 'top 82%',
          onEnter: () => {
            gsap.fromTo(
              seccion,
              { opacity: 0, y: 35 },
              { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
            );
          },
          once: true,
        });
        this.scrollTriggers.push(trigger);
      });

      // 3. Tarjetas interactivas con revelación escalonada
      const tarjetas = document.querySelectorAll('.anim-scroll-card');
      if (tarjetas.length > 0) {
        const triggerCards = ScrollTrigger.create({
          trigger: '.contenedor-tarjetas-story',
          start: 'top 80%',
          onEnter: () => {
            gsap.fromTo(
              tarjetas,
              { opacity: 0, y: 30 },
              { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: 'power2.out' },
            );
          },
          once: true,
        });
        this.scrollTriggers.push(triggerCards);
      }
    } catch (err) {
      // Si la carga diferida falla en algún entorno, la interfaz se mantiene 100% visible
      console.warn('Animaciones GSAP no disponibles en este entorno:', err);
    }
  }

  ngOnDestroy(): void {
    this.limpiarIntervalo();
    if (this.scrollTriggers.length > 0) {
      this.scrollTriggers.forEach((st) => st.kill());
      this.scrollTriggers = [];
    }
  }

  // --- Lógica del simulador de Asistente de Entreno ---
  toggleDescanso(): void {
    if (this.descansoActivo()) {
      this.pausarDescanso();
    } else {
      this.iniciarDescanso();
    }
  }

  iniciarDescanso(): void {
    this.descansoActivo.set(true);
    this.limpiarIntervalo();
    this.intervaloDescanso = setInterval(() => {
      const actual = this.descansoSegundos();
      if (actual > 0) {
        this.descansoSegundos.set(actual - 1);
        this.cdr.markForCheck();
      } else {
        this.pausarDescanso();
        this.descansoSegundos.set(90);
        this.cdr.markForCheck();
      }
    }, 1000);
  }

  pausarDescanso(): void {
    this.descansoActivo.set(false);
    this.limpiarIntervalo();
    this.cdr.markForCheck();
  }

  reiniciarDescanso(): void {
    this.pausarDescanso();
    this.descansoSegundos.set(90);
    this.cdr.markForCheck();
  }

  ajustarPeso(delta: number): void {
    const nuevo = Math.max(2.5, Math.min(250, this.pesoActual() + delta));
    this.pesoActual.set(Number(nuevo.toFixed(1)));
    this.cdr.markForCheck();
  }

  ajustarReps(delta: number): void {
    const nuevas = Math.max(1, Math.min(50, this.repsActual() + delta));
    this.repsActual.set(nuevas);
    this.cdr.markForCheck();
  }

  completarSerie(): void {
    if (this.serieActual() < this.serieTotal) {
      this.serieActual.update((s) => s + 1);
      this.descansoSegundos.set(90);
      this.iniciarDescanso();
    } else {
      this.serieActual.set(1);
      this.pausarDescanso();
      this.descansoSegundos.set(90);
    }
    this.cdr.markForCheck();
  }

  formatearTiempo(segundos: number): string {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  esAdmin(): boolean {
    return this.usuarioActual()?.rol === 'ADMIN';
  }

  private limpiarIntervalo(): void {
    if (this.intervaloDescanso) {
      clearInterval(this.intervaloDescanso);
      this.intervaloDescanso = null;
    }
  }
}
