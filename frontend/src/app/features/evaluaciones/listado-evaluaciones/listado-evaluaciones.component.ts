import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { Area } from '../../../core/models/area.model';
import { Cargo } from '../../../core/models/cargo.model';
import { Empresa } from '../../../core/models/empresa.model';
import { EvaluacionListItem } from '../../../core/models/evaluacion.model';
import { AreasService } from '../../../core/services/areas.service';
import { CargosService } from '../../../core/services/cargos.service';
import { EmpresaService } from '../../../core/services/empresa.service';
import { EvaluacionesService } from '../../../core/services/evaluaciones.service';

@Component({
  selector: 'app-listado-evaluaciones',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './listado-evaluaciones.component.html',
  styleUrl: './listado-evaluaciones.component.scss'
})
export class ListadoEvaluacionesComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly empresaService = inject(EmpresaService);
  private readonly areasService = inject(AreasService);
  private readonly cargosService = inject(CargosService);
  private readonly evaluacionesService = inject(EvaluacionesService);

  readonly empresas = signal<Empresa[]>([]);
  readonly areas = signal<Area[]>([]);
  readonly cargos = signal<Cargo[]>([]);
  readonly evaluaciones = signal<EvaluacionListItem[]>([]);

  readonly loadingEmpresas = signal(false);
  readonly loadingAreas = signal(false);
  readonly loadingCargos = signal(false);
  readonly loadingEvaluaciones = signal(false);
  readonly deletingId = signal<number | null>(null);

  readonly selectedEmpresaId = signal<number | null>(null);
  readonly selectedAreaId = signal<number | null>(null);

  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  filtrosForm = this.fb.group({
    idEmpresa: [null as number | null],
    idArea: [null as number | null],
    idCargo: [null as number | null],
    cedulaEmpleado: [''],
    fechaDesde: [''],
    fechaHasta: ['']
  });

  readonly hasResultados = computed(() => this.evaluaciones().length > 0);

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

        this.selectedEmpresaId.set(null);

        this.filtrosForm.patchValue({
          idEmpresa: null,
          idArea: null,
          idCargo: null
        });

        this.areas.set([]);
        this.cargos.set([]);

        this.buscar();
      },
      error: () => this.errorMessage.set('No fue posible cargar las empresas.')
    });
}

  onEmpresaChange(): void {
    const idEmpresa = this.filtrosForm.value.idEmpresa ?? null;
    this.selectedEmpresaId.set(idEmpresa);
    this.selectedAreaId.set(null);

    this.filtrosForm.patchValue({
      idArea: null,
      idCargo: null
    });

    this.areas.set([]);
    this.cargos.set([]);

    if (idEmpresa) {
      this.cargarAreas(idEmpresa);
    } else {
      this.buscar();
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
          this.buscar();
        },
        error: () => this.errorMessage.set('No fue posible cargar las áreas.')
      });
  }

  onAreaChange(): void {
    const idEmpresa = this.filtrosForm.value.idEmpresa ?? null;
    const idArea = this.filtrosForm.value.idArea ?? null;

    this.selectedAreaId.set(idArea);
    this.filtrosForm.patchValue({ idCargo: null });
    this.cargos.set([]);

    if (idEmpresa && idArea) {
      this.cargarCargos(idEmpresa, idArea);
    } else {
      this.buscar();
    }
  }

  cargarCargos(idEmpresa: number, idArea: number): void {
    this.loadingCargos.set(true);
    this.errorMessage.set('');

    this.cargosService.listarPorArea(idEmpresa, idArea)
      .pipe(finalize(() => this.loadingCargos.set(false)))
      .subscribe({
        next: (data) => {
          this.cargos.set(data.filter(x => x.activo));
          this.buscar();
        },
        error: () => this.errorMessage.set('No fue posible cargar los cargos.')
      });
  }

  buscar(): void {
    this.loadingEvaluaciones.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.evaluacionesService.listar({
      idEmpresa: this.filtrosForm.value.idEmpresa || null,
      idArea: this.filtrosForm.value.idArea || null,
      idCargo: this.filtrosForm.value.idCargo || null,
      cedula: this.filtrosForm.value.cedulaEmpleado || null,
      fechaDesde: this.filtrosForm.value.fechaDesde || null,
      fechaHasta: this.filtrosForm.value.fechaHasta || null
    })
    .pipe(finalize(() => this.loadingEvaluaciones.set(false)))
    .subscribe({
      next: (data) => this.evaluaciones.set(data),
      error: (error) => {
        if (error?.status === 401) {
          this.errorMessage.set('Tu sesión expiró. Inicia sesión nuevamente.');
          return;
        }

        this.errorMessage.set('No fue posible cargar las evaluaciones.');
      }
    });
  }

  limpiarFiltros(): void {
  this.selectedEmpresaId.set(null);
  this.selectedAreaId.set(null);

  this.filtrosForm.reset({
    idEmpresa: null,
    idArea: null,
    idCargo: null,
    cedulaEmpleado: '',
    fechaDesde: '',
    fechaHasta: ''
  });

  this.areas.set([]);
  this.cargos.set([]);
  this.buscar();
}

  continuar(idEvaluacion: number): void {
    this.router.navigate(['/evaluaciones/nueva'], {
      queryParams: { editar: idEvaluacion }
    });
  }

  verDetalle(idEvaluacion: number): void {
    if (!idEvaluacion) {
      this.errorMessage.set('No se pudo abrir el detalle de la evaluación.');
      return;
    }

    this.router.navigate(['/evaluaciones/detalle', idEvaluacion]);
  }

  eliminarBorrador(idEvaluacion: number): void {
    const confirmado = window.confirm('¿Deseas eliminar este borrador?');
    if (!confirmado) return;

    this.deletingId.set(idEvaluacion);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.evaluacionesService.eliminarBorrador(idEvaluacion)
      .pipe(finalize(() => this.deletingId.set(null)))
      .subscribe({
        next: () => {
          this.successMessage.set('Borrador eliminado correctamente.');
          this.buscar();
        },
        error: (error) => {
          if (error?.status === 401) {
            this.errorMessage.set('Tu sesión expiró. Inicia sesión nuevamente.');
            return;
          }

          this.errorMessage.set('No fue posible eliminar el borrador.');
        }
      });
  }
}