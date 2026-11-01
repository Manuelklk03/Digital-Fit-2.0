import { AuthService } from './../../../../services/auth-service';
import { AdminSoporteService } from './../../../../services/admin/admin-soporte-service';
import { Footer } from './../../../../components/footer/footer';
import { HeaderComponent } from './../../../../components/header/header';
import { ChangeDetectorRef, Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-soporte',
  imports: [HeaderComponent, Footer, FormsModule, RouterLink],
  templateUrl: './soporte-admin.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './soporte-admin.css',
})
export class AdminSoporteComponent {
  private adminSoporteService = inject(AdminSoporteService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  tickets: any[] = [];
  ticketsFiltrados: any[] = [];

  tipoBusqueda = 'general';
  valorBusqueda = '';

  mostrarPopup = false;
  textoPopup = '';
  tipoPopup: 'exito' | 'error' = 'exito';
  private popupTimeout: any;

  ngOnInit(): void {
    this.authService.me().subscribe({
      next: (usuario: any) => {
        if (usuario?.rol !== 'ADMIN') {
          this.router.navigate(['/soporte']);
          return;
        }

        this.cargarTickets();
      },
      error: () => {
        this.router.navigate(['/login']);
      },
    });
  }

  cargarTickets(): void {
    this.adminSoporteService.getTicketsAdmin().subscribe({
      next: (data: any[]) => {
        this.tickets = data;
        this.aplicarBusqueda();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('ERROR TICKETS ADMIN:', err);
        this.abrirPopup('No se pudieron cargar los tickets.', 'error');
      },
    });
  }

  cambiarEstado(id: number, estado: string): void {
    this.adminSoporteService.cambiarEstado(id, estado).subscribe({
      next: () => {
        this.abrirPopup('Estado actualizado correctamente.', 'exito');
        this.cargarTickets();
      },
      error: () => {
        this.abrirPopup('No se pudo actualizar el estado.', 'error');
      },
    });
  }

  borrarTicket(id: number): void {
    this.adminSoporteService.borrarTicketCerrado(id).subscribe({
      next: () => {
        this.abrirPopup('Ticket borrado correctamente.', 'exito');
        this.cargarTickets();
      },
      error: () => {
        this.abrirPopup('Solo se pueden borrar tickets cerrados.', 'error');
      },
    });
  }

  aplicarBusqueda(): void {
    const texto = this.valorBusqueda.trim().toLowerCase();

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

      if (this.tipoBusqueda === 'fecha') {
        return fecha.includes(texto);
      }

      if (this.tipoBusqueda === 'estado') {
        return estado.includes(texto);
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
    this.valorBusqueda = '';
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
        return estado;
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
