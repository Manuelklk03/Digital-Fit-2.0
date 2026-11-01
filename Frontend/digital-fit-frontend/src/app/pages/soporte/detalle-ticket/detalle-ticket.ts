import {
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HeaderComponent } from '../../../components/header/header';
import { Footer } from '../../../components/footer/footer';
import { SoporteService } from '../../../services/soporte';
import { AuthService } from '../../../services/auth-service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-detalle-ticket',
  imports: [HeaderComponent, Footer, RouterLink, FormsModule],
  templateUrl: './detalle-ticket.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './detalle-ticket.css',
})
export class DetalleTicketComponent implements OnDestroy {
  private route = inject(ActivatedRoute);
  private soporteService = inject(SoporteService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  ticket: any = null;
  mensajes: any[] = [];
  usuarioActual: any = null;
  ticketId = 0;

  nuevoMensaje = '';
  adminHaRespondido = false;

  private refreshInterval: any;

  ngOnInit(): void {
    this.authService.me().subscribe({
      next: (usuario: any) => {
        this.usuarioActual = usuario;

        if (usuario?.rol === 'ADMIN') {
          this.router.navigate(['/admin/soporte']);
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
    this.soporteService.getTicketById(this.ticketId).subscribe({
      next: (data: any) => {
        this.ticket = data;
        this.cargarMensajes();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('ERROR DETALLE TICKET:', err);
      },
    });
  }

  cargarMensajes(): void {
    this.soporteService.getMensajesTicket(this.ticketId).subscribe({
      next: (data: any[]) => {
        this.mensajes = data;
        this.adminHaRespondido = this.mensajes.some(
          (mensaje: any) => mensaje.emisorRol === 'ADMIN',
        );
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('ERROR MENSAJES TICKET:', err);
      },
    });
  }

  puedeResponder(): boolean {
    return !!this.ticket && this.ticket.estado !== 'CERRADO' && this.adminHaRespondido;
  }

  enviarMensaje(): void {
    if (!this.nuevoMensaje.trim() || !this.puedeResponder()) {
      return;
    }

    this.soporteService.enviarMensajeTicket(this.ticketId, this.nuevoMensaje).subscribe({
      next: () => {
        this.nuevoMensaje = '';
        this.cargarMensajes();
      },
      error: (err: any) => {
        console.error('ERROR ENVIAR MENSAJE USUARIO:', err);
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
        return estado || 'Sin estado';
    }
  }

  claseEstado(estado: string): string {
    switch (estado) {
      case 'ABIERTO':
        return 'estado-abierto';
      case 'EN_PROCESO':
        return 'estado-proceso';
      case 'CERRADO':
        return 'estado-cerrado';
      default:
        return '';
    }
  }

  esMensajeMio(mensaje: any): boolean {
    return mensaje?.emisorUsername === this.usuarioActual?.username;
  }

  esMensajeAdmin(mensaje: any): boolean {
    return mensaje?.emisorRol === 'ADMIN';
  }
}
