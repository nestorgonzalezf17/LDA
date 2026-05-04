import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { Area } from '../../../core/models/area.model';
import { Empresa } from '../../../core/models/empresa.model';
import { AreasService } from '../../../core/services/areas.service';
import { EmpresaService } from '../../../core/services/empresa.service';

@Component({
  selector: 'app-areas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './areas.component.html',
  styleUrl: './areas.component.scss'
})
export class AreasComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly areasService = inject(AreasService);
  private readonly empresaService = inject(EmpresaService);

  readonly empresas = signal<Empresa[]>([]);
  readonly selectedEmpresaId = signal<number | null>(null);

  readonly areas = signal<Area[]>([]);
  readonly loadingEmpresas = signal(false);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly changingStateId = signal<number | null>(null);
  readonly editingArea = signal<Area | null>(null);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  readonly isEditing = computed(() => !!this.editingArea());
  readonly title = computed(() => this.isEditing() ? 'Editar área' : 'Nueva área');

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(150)]],
    activo: [true]
  });

  ngOnInit(): void {
    this.cargarEmpresas();
  }

  cargarEmpresas(): void {
    this.loadingEmpresas.set(true);
    this.errorMessage.set('');

    this.empresaService.listar()
      .pipe(finalize(() => this.loadingEmpresas.set(false)))
      .subscribe({
        next: (data) => {
          const activas = data.filter(x => x.activo);
          this.empresas.set(activas);

          if (activas.length > 0 && !this.selectedEmpresaId()) {
            this.selectedEmpresaId.set(activas[0].idEmpresa);
            this.cargarAreas();
          }
        },
        error: () => this.errorMessage.set('No fue posible cargar las empresas.')
      });
  }

  onEmpresaChange(value: string): void {
    const idEmpresa = value ? Number(value) : null;
    this.selectedEmpresaId.set(Number.isNaN(idEmpresa) ? null : idEmpresa);
    this.cancelarEdicion();
    this.cargarAreas();
  }

  cargarAreas(): void {
    const idEmpresa = this.selectedEmpresaId();

    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.areasService.listar(idEmpresa)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => this.areas.set(data),
        error: () => this.errorMessage.set('No fue posible cargar las áreas.')
      });
  }

  editar(area: Area): void {
    this.editingArea.set(area);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.selectedEmpresaId.set(area.idEmpresa);

    this.form.patchValue({
      nombre: area.nombre,
      activo: area.activo
    });
  }

  cancelarEdicion(): void {
    this.editingArea.set(null);
    this.form.reset({
      nombre: '',
      activo: true
    });
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const idEmpresa = this.selectedEmpresaId();
    if (!idEmpresa) {
      this.errorMessage.set('Debes seleccionar una empresa.');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const nombre = this.form.value.nombre?.trim() ?? '';

    const payload = {
      idEmpresa,
      nombre,
      activo: this.editingArea()?.activo ?? !!this.form.value.activo
    };

    const request$ = this.isEditing()
      ? this.areasService.actualizar(this.editingArea()!.idArea, payload)
      : this.areasService.crear(payload);

    request$
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.successMessage.set(
            this.isEditing()
              ? 'Área actualizada correctamente.'
              : 'Área guardada correctamente.'
          );

          this.cancelarEdicion();
          this.cargarAreas();
        },
        error: (error: any) => {
          this.errorMessage.set(this.obtenerMensajeError(error));
        }
      });
  }

  cambiarEstado(area: Area): void {
    const accion = area.activo ? 'inactivar' : 'activar';
    const confirmado = window.confirm(`¿Deseas ${accion} el área "${area.nombre}"?`);
    if (!confirmado) return;

    this.changingStateId.set(area.idArea);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.areasService.cambiarEstado(area.idArea, !area.activo)
      .pipe(finalize(() => this.changingStateId.set(null)))
      .subscribe({
        next: () => {
          this.successMessage.set(
            area.activo ? 'Área inactivada correctamente.' : 'Área activada correctamente.'
          );

          if (this.editingArea()?.idArea === area.idArea) {
            this.cancelarEdicion();
          }

          this.cargarAreas();
        },
        error: () => {
          this.errorMessage.set('No fue posible cambiar el estado del área.');
        }
      });
  }

  private obtenerMensajeError(error: any): string {
    const raw =
      error?.error?.mensaje ||
      error?.error ||
      error?.message ||
      '';

    const text = typeof raw === 'string' ? raw : JSON.stringify(raw);

    if (text.includes('Ya existe un área activa con ese nombre')) {
      return 'Ya existe un área activa con ese nombre para la empresa seleccionada.';
    }

    if (text.includes('Ya existe otra área activa con ese nombre')) {
      return 'Ya existe otra área activa con ese nombre para la empresa seleccionada.';
    }

    if (text.includes('duplicate') || text.includes('duplicada')) {
      return 'Ya existe un área con ese nombre para la empresa seleccionada.';
    }

    return 'No fue posible guardar el área.';
  }
}