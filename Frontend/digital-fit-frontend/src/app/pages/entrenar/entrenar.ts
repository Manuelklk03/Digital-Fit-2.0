import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { AuthService } from '../../services/auth-service';
import { BadgeComponent, ButtonComponent, CardComponent } from '../../components/ui';

export interface SerieEjercicio {
  numero: number;
  pesoKg: number;
  repeticiones: number;
  completada: boolean;
}

export interface EjercicioActivo {
  id: number;
  nombre: string;
  grupoMuscular: string;
  series: SerieEjercicio[];
}

@Component({
  selector: 'app-entrenar',
  imports: [HeaderComponent, Footer, ButtonComponent, BadgeComponent, CardComponent],
  templateUrl: './entrenar.html',
  styleUrl: './entrenar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntrenarComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Estado general de la sesión
  readonly nombreEntrenamiento = signal('Fuerza e Hipertrofia — Pierna y Core');
  readonly indiceEjercicio = signal(0);
  readonly tiempoTotalSegundos = signal(1240); // 20m 40s
  private intervaloReloj?: ReturnType<typeof setInterval>;

  // Cronómetro regresivo de descanso
  readonly descansoActivo = signal(false);
  readonly descansoSegundosRestantes = signal(90);
  private intervaloDescanso?: ReturnType<typeof setInterval>;

  readonly ejercicios = signal<EjercicioActivo[]>([
    {
      id: 1,
      nombre: 'Sentadilla con barra trasera',
      grupoMuscular: 'Cuádriceps y Glúteos',
      series: [
        { numero: 1, pesoKg: 80, repeticiones: 10, completada: true },
        { numero: 2, pesoKg: 85, repeticiones: 8, completada: true },
        { numero: 3, pesoKg: 90, repeticiones: 8, completada: false },
        { numero: 4, pesoKg: 90, repeticiones: 6, completada: false },
      ],
    },
    {
      id: 2,
      nombre: 'Prensa inclinada a 45°',
      grupoMuscular: 'Cuádriceps',
      series: [
        { numero: 1, pesoKg: 140, repeticiones: 12, completada: false },
        { numero: 2, pesoKg: 160, repeticiones: 10, completada: false },
        { numero: 3, pesoKg: 160, repeticiones: 10, completada: false },
      ],
    },
    {
      id: 3,
      nombre: 'Elevación de talones de pie',
      grupoMuscular: 'Gemelos',
      series: [
        { numero: 1, pesoKg: 50, repeticiones: 15, completada: false },
        { numero: 2, pesoKg: 50, repeticiones: 15, completada: false },
        { numero: 3, pesoKg: 50, repeticiones: 12, completada: false },
      ],
    },
  ]);

  readonly ejercicioActual = computed(() => {
    const list = this.ejercicios();
    return list[this.indiceEjercicio()] ?? list[0];
  });

  readonly totalSeriesCompletadas = computed(() => {
    let count = 0;
    for (const ej of this.ejercicios()) {
      for (const s of ej.series) {
        if (s.completada) count++;
      }
    }
    return count;
  });

  readonly totalSeriesGlobal = computed(() => {
    let count = 0;
    for (const ej of this.ejercicios()) {
      count += ej.series.length;
    }
    return count;
  });

  readonly descansoFormateado = computed(() => {
    const seg = this.descansoSegundosRestantes();
    const min = Math.floor(seg / 60);
    const resto = seg % 60;
    return `${min.toString().padStart(2, '0')}:${resto.toString().padStart(2, '0')}`;
  });

  readonly tiempoTotalFormateado = computed(() => {
    const seg = this.tiempoTotalSegundos();
    const min = Math.floor(seg / 60);
    const resto = seg % 60;
    return `${min.toString().padStart(2, '0')}:${resto.toString().padStart(2, '0')}`;
  });

  ngOnInit(): void {
    this.intervaloReloj = setInterval(() => {
      this.tiempoTotalSegundos.update((t) => t + 1);
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.intervaloReloj) clearInterval(this.intervaloReloj);
    if (this.intervaloDescanso) clearInterval(this.intervaloDescanso);
  }

  completarSerie(serieNumero: number): void {
    this.ejercicios.update((ejercicios) => {
      const idx = this.indiceEjercicio();
      const actual = ejercicios[idx];
      const seriesActualizadas = actual.series.map((s) =>
        s.numero === serieNumero ? { ...s, completada: true } : s,
      );
      ejercicios[idx] = { ...actual, series: seriesActualizadas };
      return [...ejercicios];
    });

    this.iniciarDescanso(90);
  }

  iniciarDescanso(segundos: number): void {
    if (this.intervaloDescanso) clearInterval(this.intervaloDescanso);
    this.descansoSegundosRestantes.set(segundos);
    this.descansoActivo.set(true);

    this.intervaloDescanso = setInterval(() => {
      this.descansoSegundosRestantes.update((s) => {
        if (s <= 1) {
          this.detenerDescanso();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  ajustarDescanso(deltaSegundos: number): void {
    this.descansoSegundosRestantes.update((s) => Math.max(0, s + deltaSegundos));
  }

  detenerDescanso(): void {
    if (this.intervaloDescanso) clearInterval(this.intervaloDescanso);
    this.descansoActivo.set(false);
  }

  modificarPeso(serieNumero: number, delta: number): void {
    this.ejercicios.update((ejercicios) => {
      const idx = this.indiceEjercicio();
      const actual = ejercicios[idx];
      const seriesActualizadas = actual.series.map((s) =>
        s.numero === serieNumero
          ? { ...s, pesoKg: Math.max(0, Math.round((s.pesoKg + delta) * 10) / 10) }
          : s,
      );
      ejercicios[idx] = { ...actual, series: seriesActualizadas };
      return [...ejercicios];
    });
  }

  modificarRepeticiones(serieNumero: number, delta: number): void {
    this.ejercicios.update((ejercicios) => {
      const idx = this.indiceEjercicio();
      const actual = ejercicios[idx];
      const seriesActualizadas = actual.series.map((s) =>
        s.numero === serieNumero
          ? { ...s, repeticiones: Math.max(1, s.repeticiones + delta) }
          : s,
      );
      ejercicios[idx] = { ...actual, series: seriesActualizadas };
      return [...ejercicios];
    });
  }

  cambiarEjercicio(nuevoIndice: number): void {
    if (nuevoIndice >= 0 && nuevoIndice < this.ejercicios().length) {
      this.indiceEjercicio.set(nuevoIndice);
    }
  }

  finalizarSesion(): void {
    this.router.navigate(['/inicio']);
  }
}
