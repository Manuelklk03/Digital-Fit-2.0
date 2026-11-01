import { SoporteService } from './../../services/soporte';
import { ChangeDetectorRef, Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-soporte',
  imports: [HeaderComponent, Footer, FormsModule, RouterLink],
  templateUrl: './soporte.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './soporte.css',
})
export class SoporteComponent {
  private soporteService = inject(SoporteService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  asunto = '';
  mensaje = '';

  tickets: any[] = [];
  ticketsFiltrados: any[] = [];
  usuarioActual: any = null;

  tipoBusqueda = 'general';
  busqueda = '';

  mostrarPopup = false;
  textoPopup = '';
  tipoPopup: 'exito' | 'error' = 'exito';
  private popupTimeout: any;

  ngOnInit(): void {
    this.authService.me().subscribe({
      next: (usuario: any) => {
        this.usuarioActual = usuario;

        if (usuario?.rol === 'ADMIN') {
          this.router.navigate(['/admin/soporte']);
          return;
        }

        this.cargarTickets();
      },
      error: () => {
        this.router.navigate(['/login']);
      },
    });
  }

  enviarFormulario(): void {
    if (!this.asunto.trim() || !this.mensaje.trim()) {
      this.abrirPopup('Debes completar todos los campos.', 'error');
      return;
    }

    const nuevoTicket = {
      asunto: this.asunto,
      mensaje: this.mensaje,
    };

    this.soporteService.crearTicket(nuevoTicket).subscribe({
      next: () => {
        this.abrirPopup('Ticket enviado correctamente.', 'exito');
        this.asunto = '';
        this.mensaje = '';
        this.cargarTickets();
      },
      error: () => {
        this.abrirPopup('No se pudo enviar el ticket.', 'error');
      },
    });
  }

  cargarTickets(): void {
    this.soporteService.getMisTickets().subscribe({
      next: (data: any[]) => {
        this.tickets = data;
        this.aplicarBusqueda();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('ERROR TICKETS:', err);
        this.abrirPopup('No se pudieron cargar los tickets.', 'error');
      },
    });
  }

  borrarTicket(id: number): void {
    this.soporteService.borrarTicket(id).subscribe({
      next: () => {
        this.abrirPopup('Ticket borrado correctamente.', 'exito');
        this.cargarTickets();
      },
      error: () => {
        this.abrirPopup('No se pudo borrar el ticket.', 'error');
      },
    });
  }

  aplicarBusqueda(): void {
    const texto = this.busqueda.trim().toLowerCase();

    if (!texto) {
      this.ticketsFiltrados = [...this.tickets];
      return;
    }

    this.ticketsFiltrados = this.tickets.filter((ticket: any) => {
      const asunto = (ticket.asunto || '').toLowerCase();
      const mensaje = (ticket.mensaje || '').toLowerCase();
      const fecha = (ticket.fecha || '').toLowerCase();
      const estado = this.mostrarEstado(ticket.estado).toLowerCase();

      if (this.tipoBusqueda === 'asunto') {
        return asunto.includes(texto);
      }

      if (this.tipoBusqueda === 'mensaje') {
        return mensaje.includes(texto);
      }

      if (this.tipoBusqueda === 'estado') {
        return estado.includes(texto);
      }

      if (this.tipoBusqueda === 'fecha') {
        return fecha.includes(texto);
      }

      return (
        asunto.includes(texto) ||
        mensaje.includes(texto) ||
        fecha.includes(texto) ||
        estado.includes(texto)
      );
    });
  }

  alCambiarBusqueda(): void {
    this.aplicarBusqueda();
  }

  limpiarBusqueda(): void {
    this.tipoBusqueda = 'general';
    this.busqueda = '';
    this.aplicarBusqueda();
  }

  mostrarEstado(estado: string): string {
    switch (estado) {
      case 'ABIERTO':
        return 'Abierto';
      case 'EN_PROCESO':
        return 'En proceso';
      case 'CERRADO':
        return 'Cerrado';
      default:
        return estado || 'Sin estado';
    }
  }

  abrirPopup(texto: string, tipo: 'exito' | 'error'): void {
    this.textoPopup = texto;
    this.tipoPopup = tipo;
    this.mostrarPopup = true;
    this.cdr.detectChanges();

    if (this.popupTimeout) {
      clearTimeout(this.popupTimeout);
    }

    this.popupTimeout = setTimeout(() => {
      this.mostrarPopup = false;
      this.cdr.detectChanges();
    }, 3000);
  }

  cerrarPopup(): void {
    this.mostrarPopup = false;
    this.cdr.detectChanges();
  }
}
