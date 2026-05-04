import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { Area } from '../../../core/models/area.model';
import { Cargo } from '../../../core/models/cargo.model';
import { Empresa } from '../../../core/models/empresa.model';
import { ItemCargo } from '../../../core/models/item-cargo.model';
import { AreasService } from '../../../core/services/areas.service';
import { CargosService } from '../../../core/services/cargos.service';
import { EmpresaService } from '../../../core/services/empresa.service';
import { ItemsCargoService } from '../../../core/services/items-cargo.service';

@Component({
  selector: 'app-items-cargo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './items-cargo.component.html',
  styleUrl: './items-cargo.component.scss'
})
export class ItemsCargoComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly empresaService = inject(EmpresaService);
  private readonly areasService = inject(AreasService);
  private readonly cargosService = inject(CargosService);
  private readonly itemsCargoService = inject(ItemsCargoService);

  readonly empresas = signal<Empresa[]>([]);
  readonly areas = signal<Area[]>([]);
  readonly cargos = signal<Cargo[]>([]);
  readonly items = signal<ItemCargo[]>([]);

  readonly loadingEmpresas = signal(false);
  readonly loadingAreas = signal(false);
  readonly loadingCargos = signal(false);
  readonly loadingItems = signal(false);
  readonly saving = signal(false);
  readonly deletingId = signal<number | null>(null);

  readonly editingItem = signal<ItemCargo | null>(null);
  readonly selectedEmpresaId = signal<number | null>(null);
  readonly selectedAreaId = signal<number | null>(null);
  readonly selectedCargoId = signal<number | null>(null);

  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  readonly isEditing = computed(() => !!this.editingItem());
  readonly title = computed(() =>
    this.isEditing() ? 'Editar ítem personalizado' : 'Nuevo ítem personalizado'
  );

  readonly idCompetenciaResponsabilidad = 1;

  filtroForm = this.fb.group({
    idArea: [null as number | null, [Validators.required]],
    idCargo: [null as number | null, [Validators.required]]
  });

  form = this.fb.group({
    textoItem: ['', [Validators.required, Validators.maxLength(1000)]]
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

    this.filtroForm.patchValue({ idArea: null, idCargo: null });
    this.selectedAreaId.set(null);
    this.selectedCargoId.set(null);
    this.areas.set([]);
    this.cargos.set([]);
    this.items.set([]);
    this.cancelarEdicion();

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
          this.areas.set(data.filter(x => x.activo));
        },
        error: () => this.errorMessage.set('No fue posible cargar las áreas.')
      });
  }

  onAreaChange(): void {
    const idArea = this.filtroForm.value.idArea;
    this.selectedAreaId.set(idArea ?? null);
    this.filtroForm.patchValue({ idCargo: null });
    this.selectedCargoId.set(null);
    this.cargos.set([]);
    this.items.set([]);
    this.cancelarEdicion();

    const idEmpresa = this.selectedEmpresaId();
    if (!idEmpresa || !idArea) return;

    this.loadingCargos.set(true);

    this.cargosService.listarPorArea(idEmpresa, idArea)
      .pipe(finalize(() => this.loadingCargos.set(false)))
      .subscribe({
        next: (data) => this.cargos.set(data),
        error: () => this.errorMessage.set('No fue posible cargar los cargos.')
      });
  }

  onCargoChange(): void {
    const idCargo = this.filtroForm.value.idCargo;
    this.selectedCargoId.set(idCargo ?? null);
    this.items.set([]);
    this.cancelarEdicion();

    if (!idCargo) return;

    this.cargarItems(idCargo);
  }

  cargarItems(idCargo: number): void {
    const idEmpresa = this.selectedEmpresaId();
    if (!idEmpresa) return;

    this.loadingItems.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.itemsCargoService.listarPorCargo(idEmpresa, idCargo)
      .pipe(finalize(() => this.loadingItems.set(false)))
      .subscribe({
        next: (data) => this.items.set(data),
        error: () => this.errorMessage.set('No fue posible cargar los ítems del cargo.')
      });
  }

  editar(item: ItemCargo): void {
    this.editingItem.set(item);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.form.patchValue({
      textoItem: item.textoItem
    });
  }

  cancelarEdicion(): void {
    this.editingItem.set(null);
    this.form.reset({
      textoItem: ''
    });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const idEmpresa = this.selectedEmpresaId();
    const idCargo = this.selectedCargoId();

    if (!idEmpresa) {
      this.errorMessage.set('Debes seleccionar una empresa.');
      return;
    }

    if (!idCargo) {
      this.errorMessage.set('Debes seleccionar un cargo.');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const payload = {
      idEmpresa,
      idCargo,
      idCompetencia: this.idCompetenciaResponsabilidad,
      textoItem: this.form.value.textoItem?.trim() ?? '',
      orden: this.editingItem()?.orden ?? null
    };

    const request$ = this.isEditing()
      ? this.itemsCargoService.actualizar(this.editingItem()!.idItemCargo, payload)
      : this.itemsCargoService.crear(payload);

    request$
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.successMessage.set(
            this.isEditing()
              ? 'Ítem actualizado correctamente.'
              : 'Ítem creado correctamente.'
          );

          this.cancelarEdicion();
          this.cargarItems(idCargo);
        },
        error: (error: any) => {
          const raw =
            error?.error?.mensaje ||
            error?.error ||
            error?.message ||
            '';

          const text = typeof raw === 'string' ? raw : JSON.stringify(raw);

          if (text.includes('Ya existe un ítem activo con ese orden')) {
            this.errorMessage.set('Ya existe un ítem activo con ese orden para este cargo.');
            return;
          }

          this.errorMessage.set('No fue posible guardar el ítem.');
        }
      });
  }

  cambiarEstado(item: ItemCargo): void {
    const accion = item.activo ? 'inactivar' : 'activar';
    const confirmado = window.confirm(`¿Deseas ${accion} este ítem personalizado?`);
    if (!confirmado) return;

    this.deletingId.set(item.idItemCargo);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.itemsCargoService.cambiarEstado(item.idItemCargo, !item.activo)
      .pipe(finalize(() => this.deletingId.set(null)))
      .subscribe({
        next: () => {
          this.successMessage.set(
            item.activo
              ? 'Ítem inactivado correctamente.'
              : 'Ítem activado correctamente.'
          );

          if (this.editingItem()?.idItemCargo === item.idItemCargo) {
            this.cancelarEdicion();
          }

          if (this.selectedCargoId()) {
            this.cargarItems(this.selectedCargoId()!);
          }
        },
        error: (error: any) => {
          const raw =
            error?.error?.mensaje ||
            error?.error ||
            error?.message ||
            '';

          const text = typeof raw === 'string' ? raw : JSON.stringify(raw);

          if (text.includes('Ya existe un ítem activo con ese orden')) {
            this.errorMessage.set(
              'No se puede activar este ítem porque ya existe otro activo con el mismo orden.'
            );
            return;
          }

          this.errorMessage.set('No fue posible cambiar el estado del ítem.');
        }
      });
  }
}