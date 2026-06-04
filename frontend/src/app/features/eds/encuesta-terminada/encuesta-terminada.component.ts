import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-encuesta-terminada',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './encuesta-terminada.component.html',
  styleUrl: '../identificacion/identificacion.component.css'
})
export class EncuestaTermizadaComponent {
  private readonly router = inject(Router);

  irAInicio(): void {
    this.router.navigate(['/eds/identificacion']);
  }
}
