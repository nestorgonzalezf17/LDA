import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { Area } from '../../../core/models/area.model';
import { Cargo } from '../../../core/models/cargo.model';
import { Empresa } from '../../../core/models/empresa.model';
import { AreasService } from '../../../core/services/areas.service';
import { CargosService } from '../../../core/services/cargos.service';
import { EmpresaService } from '../../../core/services/empresa.service';

@Component({
  selector: 'app-cargos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cargos.component.html',
  styleUrl: './cargos.component.scss'
})
export class CargosComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly empresaService = inject(EmpresaService);
  private readonly areasService = inject(AreasService);
  private readonly cargosService = inject(CargosService);

  readonly empresas = signal<Empresa[]>([]);
  readonly areas = signal<Area[]>([]);
  readonly cargos = signal<Cargo[]>([]);

  readonly loadingEmpresas = signal(false);
  readonly loadingAreas = signal(false);
  readonly loadingCargos = signal(false);
  readonly saving = signal(false);
  readonly changingStateId = signal<number | null>(null);

  readonly editingCargo = signal<Cargo | null>(null);
  readonly selectedEmpresaId = signal<number | null>(null);
  readonly selectedAreaId = signal<number | null>(null);

  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  readonly isEditing = computed(() => !!this.editingCargo());
  readonly title = computed(() => this.isEditing() ? 'Editar cargo' : 'Nuevo cargo');

  form = this.fb.group({
    idArea: [null as number | null, [Validators.required]],
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
            const idEmpresa = activas[0].idEmpresa;
            this.selectedEmpresaId.set(idEmpresa);
            this.cargarAreas(idEmpresa);
          }
        },
        error: () => this.errorMessage.set('No fue posible cargar las empresas.')
      });
  }

  onEmpresaChange(value: string): void {
    const idEmpresa = value ? Number(value) : null;
    this.selectedEmpresaId.set(Number.isNaN(idEmpresa) ? null : idEmpresa);
    this.selectedAreaId.set(null);
    this.areas.set([]);
    this.cargos.set([]);
    this.cancelarEdicion(false);
    this.form.patchValue({ idArea: null });

    if (this.selectedEmpresaId()) {
      this.cargarAreas(this.selectedEmpresaId()!);
    }
  }

  cargarAreas(idEmpresa: number): void {
    this.loadingAreas.set(true);
    this.errorMessage.set('');

    this.areasService.listar(idEmpresa)
      .pipe(finalize(() => this.loadingAreas.set(false)))
      .subscribe({
        next: (data) => {
          const activas = data.filter(x => x.activo);
          this.areas.set(activas);

          if (activas.length > 0 && !this.selectedAreaId()) {
            const idArea = activas[0].idArea;
            this.selectedAreaId.set(idArea);
            this.form.patchValue({ idArea });
            this.cargarCargos(idArea);
          }
        },
        error: () => this.errorMessage.set('No fue posible cargar las áreas.')
      });
  }

  onAreaChange(): void {
    const idArea = this.form.value.idArea;
    this.selectedAreaId.set(idArea ?? null);
    this.cancelarEdicion(false);

    if (idArea) {
      this.cargarCargos(idArea);
    } else {
      this.cargos.set([]);
    }
  }

  cargarCargos(idArea: number): void {
    const idEmpresa = this.selectedEmpresaId();
    if (!idEmpresa) return;

    this.loadingCargos.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.cargosService.listarPorArea(idEmpresa, idArea)
      .pipe(finalize(() => this.loadingCargos.set(false)))
      .subscribe({
        next: (data) => this.cargos.set(data),
        error: () => this.errorMessage.set('No fue posible cargar los cargos.')
      });
  }

  editar(cargo: Cargo): void {
    this.editingCargo.set(cargo);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.selectedEmpresaId.set(cargo.idEmpresa);
    this.selectedAreaId.set(cargo.idArea);

    this.form.patchValue({
      idArea: cargo.idArea,
      nombre: cargo.nombre,
      activo: cargo.activo
    });

    this.cargarAreas(cargo.idEmpresa);
    this.cargarCargos(cargo.idArea);
  }

  cancelarEdicion(resetArea = true): void {
    const areaActual = resetArea ? this.selectedAreaId() : this.form.value.idArea;

    this.editingCargo.set(null);
    this.form.reset({
      idArea: areaActual ?? null,
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
    const idArea = this.form.value.idArea;
    const nombre = this.form.value.nombre?.trim() ?? '';

    if (!idEmpresa) {
      this.errorMessage.set('Debes seleccionar una empresa.');
      return;
    }

    if (!idArea) {
      this.errorMessage.set('Debes seleccionar un área.');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const payload = {
      idEmpresa,
      idArea,
      nombre,
      activo: this.editingCargo()?.activo ?? !!this.form.value.activo
    };

    const request$ = this.isEditing()
      ? this.cargosService.actualizar(this.editingCargo()!.idCargo, payload)
      : this.cargosService.crear(payload);

    request$
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.successMessage.set(
            this.isEditing()
              ? 'Cargo actualizado correctamente.'
              : 'Cargo guardado correctamente.'
          );

          this.cancelarEdicion();
          this.cargarCargos(idArea);
        },
        error: (error: any) => {
          this.errorMessage.set(this.obtenerMensajeError(error));
        }
      });
  }

  cambiarEstado(cargo: Cargo): void {
    const accion = cargo.activo ? 'inactivar' : 'activar';
    const confirmado = window.confirm(`¿Deseas ${accion} el cargo "${cargo.nombre}"?`);
    if (!confirmado) return;

    this.changingStateId.set(cargo.idCargo);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.cargosService.cambiarEstado(cargo.idCargo, !cargo.activo)
      .pipe(finalize(() => this.changingStateId.set(null)))
      .subscribe({
        next: () => {
          this.successMessage.set(
            cargo.activo ? 'Cargo inactivado correctamente.' : 'Cargo activado correctamente.'
          );

          if (this.editingCargo()?.idCargo === cargo.idCargo) {
            this.cancelarEdicion(false);
          }

          if (this.selectedAreaId()) {
            this.cargarCargos(this.selectedAreaId()!);
          }
        },
        error: () => {
          this.errorMessage.set('No fue posible cambiar el estado del cargo.');
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

    if (text.includes('Ya existe un cargo activo con ese nombre')) {
      return 'Ya existe un cargo activo con ese nombre para el área y empresa seleccionadas.';
    }

    if (text.includes('Ya existe otro cargo activo con ese nombre')) {
      return 'Ya existe otro cargo activo con ese nombre para el área y empresa seleccionadas.';
    }

    if (text.includes('duplicate') || text.includes('duplicada')) {
      return 'Ya existe un cargo con ese nombre o código.';
    }

    return 'No fue posible guardar el cargo.';
  }
}