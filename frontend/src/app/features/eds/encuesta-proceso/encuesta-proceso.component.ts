import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-encuesta-proceso',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './encuesta-proceso.component.html',
  styleUrl: '../identificacion/identificacion.component.css'
})
export class EncuestaProcesoComponent {
  private readonly router = inject(Router);

  idFormulario = signal<number | null>(null);
  cedula = signal('');
  nombre = signal('');

  constructor() {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { idFormulario: number; cedula: string; nombre: string };

    if (!state || !state.cedula) {
      // Redirigir al inicio si se ingresa de forma directa
      this.router.navigate(['/eds/identificacion']);
    } else {
      this.idFormulario.set(state.idFormulario);
      this.cedula.set(state.cedula);
      this.nombre.set(state.nombre);
    }
  }

  reanudarEncuesta(): void {
    // Navegar al componente de la encuesta pasandole la informacion sociodemografica en el state
    const datosFormulario = {
      idFormulario: this.idFormulario(),
      cedula: this.cedula(),
      nombre: this.nombre()
    };
    this.router.navigate(['/eds/encuesta'], { state: datosFormulario });
  }

  cancelar(): void {
    this.router.navigate(['/eds/identificacion']);
  }
}
