import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EvaluacionesService } from '../../../core/services/evaluaciones.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-identificacion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './identificacion.component.html',
  styleUrl: './identificacion.component.css'
})
export class IdentificacionComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly evaluacionesService = inject(EvaluacionesService);

  form: FormGroup;
  buscando = signal(false);
  empleadoValido = signal(false);
  nombreCompleto = signal('');
  errorMessage = signal('');

  constructor() {
    this.form = this.fb.group({
      cedula: ['', [Validators.required, Validators.pattern('^[0-9]+$')]]
    });
  }

  buscarEmpleado(): void {
    const cedula = this.form.get('cedula')?.value;
    if (this.form.invalid || !cedula) {
      this.errorMessage.set('Debe ingresar un número de cédula válido.');
      return;
    }

    this.buscando.set(true);
    this.errorMessage.set('');
    this.empleadoValido.set(false);
    this.nombreCompleto.set('');

    this.evaluacionesService.buscarEmpleadoNominaPorCedula(cedula)
      .pipe(finalize(() => this.buscando.set(false)))
      .subscribe({
        next: (emp) => {
          this.nombreCompleto.set(`${emp.nombresEmpleado} ${emp.apellidosEmpleado}`);
          this.empleadoValido.set(true);
        },
        error: (err) => {
          this.errorMessage.set(err.error?.mensaje || 'No se encontró el empleado en la nómina, o se encuentra inactivo.');
          this.empleadoValido.set(false);
        }
      });
  }

  continuar(): void {
    if (this.empleadoValido()) {
      const cedula = this.form.get('cedula')?.value;
      // Redirección al siguiente componente que se creará más adelante (pasando la cédula en el state)
      this.router.navigate(['/eds/formulario'], { state: { cedula, nombre: this.nombreCompleto() } });
    }
  }
}
