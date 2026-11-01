import {
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderComponent } from '../../../../components/header/header';
import { Footer } from '../../../../components/footer/footer';
import { AdminSoporteService } from '../../../../services/admin/admin-soporte-service';
import { AuthService } from '../../../../services/auth-service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-detalle-ticket',
  imports: [HeaderComponent, Footer, FormsModule],
  templateUrl: './admin-detalle-ticket.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './admin-detalle-ticket.css',
})
export class AdminDetalleTicketComponent implements OnDestroy {
  private route = inject(ActivatedRoute);
  private adminSoporteService = inject(AdminSoporteService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  ticket: any = null;
  mensajes: any[] = [];
  ticketId = 0;
  nuevoMensaje = '';

  mostrarPopup = false;
  textoPopup = '';
  tipoPopup: 'exito' | 'error' = 'exito';
  private popupTimeout: any;
  private refreshInterval: any;

  ngOnInit(): void {
    this.authService.me().subscribe({
      next: (usuario: any) => {
        if (usuario?.rol !== 'ADMIN') {
          this.router.navigate(['/inicio']);
          return;
        }

        this.ticketId = Number(this.route.snapshot.paramMap.get('id'));
        this.cargarDetalleCompleto();

        this.refreshInterval = setInterval(() => {
          this.cargarMensajes();
        }, 8000);
      },
      error: () => {
        this.router.navigate(['/login']);
      },
    });
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  cargarDetalleCompleto(): void {
    this.adminSoporteService.getTicketAdminById(this.ticketId).subscribe({
      next: (data: any) => {
        this.ticket = data;
        this.cargarMensajes();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('ERROR DETALLE TICKET ADMIN:', err);
        this.abrirPopup('No se pudo cargar el ticket.', 'error');
      },
    });
  }

  cargarMensajes(): void {
    this.adminSoporteService.getMensajesTicketAdmin(this.ticketId).subscribe({
      next: (data: any[]) => {
        this.mensajes = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('ERROR MENSAJES TICKET ADMIN:', err);
      },
    });
  }

  cambiarEstado(estado: string): void {
    if (!this.ticket) {
      return;
    }

    this.adminSoporteService.cambiarEstado(this.ticket.id, estado).subscribe({
      next: (data: any) => {
        this.ticket = data;
        this.abrirPopup('Estado actualizado correctamente.', 'exito');
        this.cdr.detectChanges();
      },
      error: () => {
        this.abrirPopup('No se pudo actualizar el estado.', 'error');
      },
    });
  }

  enviarMensaje(): void {
    if (!this.ticket || !this.nuevoMensaje.trim() || this.ticket.estado === 'CERRADO') {
      return;
    }

    this.adminSoporteService.enviarMensajeAdmin(this.ticket.id, this.nuevoMensaje).subscribe({
      next: () => {
        this.nuevoMensaje = '';
        this.cargarDetalleCompleto();
        this.abrirPopup('Mensaje enviado correctamente.', 'exito');
      },
      error: () => {
        this.abrirPopup('No se pudo enviar el mensaje.', 'error');
      },
    });
  }

  borrarTicket(): void {
    if (!this.ticket) {
      return;
    }

    this.adminSoporteService.borrarTicketCerrado(this.ticket.id).subscribe({
      next: () => {
        this.abrirPopup('Ticket borrado correctamente.', 'exito');
        setTimeout(() => {
          this.router.navigate(['/admin/soporte']);
        }, 900);
      },
      error: () => {
        this.abrirPopup('Solo se pueden borrar tickets cerrados.', 'error');
      },
    });
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

  esMensajeAdmin(mensaje: any): boolean {
    return mensaje?.emisorRol === 'ADMIN';
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
