import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EdsService } from '../../../core/services/eds.service';
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
  private readonly edsService = inject(EdsService);

  form: FormGroup;
  buscando = signal(false);
  empleadoValido = signal(false);
  nombreCompleto = signal('');
  errorMessage = signal('');
  formularioAnterior: any = null;

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
    this.formularioAnterior = null;

    this.edsService.verificarCedulaFormularioNomina(cedula)
      .pipe(finalize(() => this.buscando.set(false)))
      .subscribe({
        next: (res) => {
          if (res.existeEnFormulario) {
            if (res.realizada) {
              this.errorMessage.set(res.mensaje || 'usted ya realizo la encuesta');
              // Llevar a la ruta de terminada
              this.router.navigate(['/eds/encuesta/terminada']);
            } else {
              // Llevar a la ruta de proceso
              this.router.navigate(['/eds/encuesta/proceso'], {
                state: {
                  idFormulario: res.idFormulario,
                  cedula: res.cedula,
                  nombre: res.nombre
                }
              });
            }
          } else {
            // Existe en nomina pero no en la tabla formulario. Habilitamos flujo normal.
            this.nombreCompleto.set(res.nombre || '');
            this.formularioAnterior = res.formularioAnterior;
            this.empleadoValido.set(true);
          }
        },
        error: (err) => {
          this.errorMessage.set(
            err.error?.mensaje || 'No se encuentra registrado, revise su cedula o pongase en contacto usted puede estar inactivo.'
          );
          this.empleadoValido.set(false);
        }
      });
  }

  continuar(): void {
    if (this.empleadoValido()) {
      const cedula = this.form.get('cedula')?.value;
      this.router.navigate(['/eds/formulario'], { 
        state: { 
          cedula, 
          nombre: this.nombreCompleto(),
          formularioAnterior: this.formularioAnterior
        } 
      });
    }
  }
}
