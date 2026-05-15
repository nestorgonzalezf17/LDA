import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LdaService, TipoCarga, RelacionHecho } from '../../../core/services/lda.service';
import { EvaluacionesService } from '../../../core/services/evaluaciones.service';
import { finalize } from 'rxjs';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-nuevo-llamado',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './nuevo-llamado.component.html',
  styleUrl: './nuevo-llamado.component.css'
})
export class NuevoLlamadoComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly ldaService = inject(LdaService);
  private readonly evaluacionesService = inject(EvaluacionesService);
  private readonly router = inject(Router);
  private readonly sanitizer = inject(DomSanitizer);

  form: FormGroup;
  tiposCarga = signal<TipoCarga[]>([]);
  relacionesHecho = signal<RelacionHecho[]>([]);
  
  loading = signal(false);
  loadingPreview = signal(false);
  buscandoEmpleado = signal(false);
  empleadoValido = signal(false);
  
  errorMessage = signal('');
  successMessage = signal('');
  
  previewUrl = signal<SafeResourceUrl | null>(null);

  constructor() {
    this.form = this.fb.group({
      fechaNotificacion: [{ value: new Date().toLocaleDateString(), disabled: true }],
      cedulaEmpleado: ['', [Validators.required]],
      nombreCompletoEmpleado: [{ value: '', disabled: true }, [Validators.required]],
      placaVehiculoAsignado: ['', [Validators.required, Validators.maxLength(10)]],
      idTipoCarga: [null, [Validators.required]],
      idRelacionHecho: [null, [Validators.required]],
      operacion: [''],
      fechaHecho: [new Date().toISOString().substring(0, 10), [Validators.required]],
      registro: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.cargarCatalogos();
  }

  cargarCatalogos(): void {
    this.ldaService.listarTiposCarga().subscribe(data => this.tiposCarga.set(data));
    this.ldaService.listarRelacionesHecho().subscribe(data => this.relacionesHecho.set(data));
  }

  buscarEmpleado(): void {
    const cedula = this.form.get('cedulaEmpleado')?.value;
    if (!cedula) return;

    this.buscandoEmpleado.set(true);
    this.errorMessage.set('');
    this.empleadoValido.set(false);

    this.evaluacionesService.buscarEmpleadoNominaPorCedula(cedula)
      .pipe(finalize(() => this.buscandoEmpleado.set(false)))
      .subscribe({
        next: (emp) => {
          this.form.patchValue({
            nombreCompletoEmpleado: `${emp.nombresEmpleado} ${emp.apellidosEmpleado}`
          });
          this.empleadoValido.set(true);
        },
        error: () => {
          this.form.patchValue({ nombreCompletoEmpleado: '' });
          this.errorMessage.set('No se encontró el empleado en nómina o está inactivo.');
        }
      });
  }

  previsualizar(): void {
    if (this.form.invalid || !this.empleadoValido()) {
      this.form.markAllAsTouched();
      this.errorMessage.set('Debe completar todos los campos antes de previsualizar.');
      return;
    }

    this.loadingPreview.set(true);
    this.errorMessage.set('');
    
    const formValues = this.form.getRawValue();
    const dto = {
      ...formValues,
      fechaHecho: new Date(formValues.fechaHecho).toISOString()
    };

    this.ldaService.previsualizar(dto)
      .pipe(finalize(() => this.loadingPreview.set(false)))
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          this.previewUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
        },
        error: (err) => {
          this.errorMessage.set('Error al generar la previsualización. Verifique que la relación del hecho tenga una plantilla válida configurada.');
        }
      });
  }

  enviarNotificacion(): void {
    if (this.form.invalid || !this.empleadoValido()) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const formValues = this.form.getRawValue();
    const dto = {
      ...formValues,
      fechaHecho: new Date(formValues.fechaHecho).toISOString()
    };

    this.ldaService.crear(dto)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.successMessage.set('Llamado de atención registrado y enviado correctamente.');
          setTimeout(() => this.router.navigate(['/inicio']), 2000);
        },
        error: (err) => {
          this.errorMessage.set(err.error?.mensaje || 'Error al guardar el registro.');
        }
      });
  }
}
