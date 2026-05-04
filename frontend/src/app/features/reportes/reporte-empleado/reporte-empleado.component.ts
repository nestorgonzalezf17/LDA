import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Empresa } from '../../../core/models/empresa.model';
import { EmpresaService } from '../../../core/services/empresa.service';
import { ReportesService } from '../../../core/services/reportes.service';

type CoincidenciaEmpleado = {
  nombresEmpleado: string;
  apellidosEmpleado: string;
  cedulaEmpleado: string;
};

type ReporteEmpleadoEvaluacion = {
  idEvaluacion: number;
  empresa?: string | null;
  fechaEvaluacion: string;
  estado: string;
  cedulaEmpleado?: string | null;
  nombresEmpleado?: string | null;
  apellidosEmpleado?: string | null;
  area: string;
  cargo: string;
  evaluador: string;
  calificacionTotal?: number | null;
};

type ReporteEmpleadoResultado = {
  resumen?: {
    nombresEmpleado: string;
    apellidosEmpleado: string;
    cedulaEmpleado: string;
    totalEvaluaciones: number;
    promedioCalificacion?: number | null;
  } | null;
  evaluaciones: ReporteEmpleadoEvaluacion[];
};

@Component({
  selector: 'app-reporte-empleado',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reporte-empleado.component.html',
  styleUrl: './reporte-empleado.component.scss'
})
export class ReporteEmpleadoComponent {
  private readonly fb = inject(FormBuilder);
  private readonly empresaService = inject(EmpresaService);
  private readonly reportesService = inject(ReportesService);

  private ignorarBusquedaProgramatica = false;

  readonly empresas = signal<Empresa[]>([]);
  readonly coincidencias = signal<CoincidenciaEmpleado[]>([]);
  readonly resultado = signal<ReporteEmpleadoResultado | null>(null);

  readonly loadingEmpresas = signal(false);
  readonly buscando = signal(false);
  readonly loading = signal(false);
  readonly exporting = signal(false);
  readonly errorMessage = signal('');

  form = this.fb.group({
    idEmpresa: [null as number | null],
    busqueda: ['']
  });

  constructor() {
    this.cargarEmpresas();

    this.form.controls.busqueda.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.onBusquedaInput());
  }

  cargarEmpresas(): void {
    this.loadingEmpresas.set(true);
    this.errorMessage.set('');

    this.empresaService.listar()
      .pipe(finalize(() => this.loadingEmpresas.set(false)))
      .subscribe({
        next: (data: Empresa[]) => {
          this.empresas.set(data.filter(x => x.activo));
        },
        error: (_error: unknown) => {
          this.errorMessage.set('No fue posible cargar las empresas.');
        }
      });
  }

  onEmpresaChange(): void {
    this.coincidencias.set([]);

    const resultadoActual = this.resultado();
    if (resultadoActual?.resumen?.cedulaEmpleado) {
      this.cargarReporte(resultadoActual.resumen.cedulaEmpleado);
      return;
    }

    const busqueda = this.form.value.busqueda?.trim() ?? '';
    if (busqueda.length >= 2) {
      this.onBusquedaInput();
    } else {
      this.resultado.set(null);
    }
  }

  onBusquedaInput(): void {
    if (this.ignorarBusquedaProgramatica) {
      return;
    }

    const busqueda = this.form.value.busqueda?.trim() ?? '';
    const idEmpresa = this.form.value.idEmpresa ?? null;

    this.errorMessage.set('');

    if (busqueda.length < 2) {
      this.coincidencias.set([]);
      this.resultado.set(null);
      return;
    }

    this.resultado.set(null);
    this.buscando.set(true);

    this.reportesService.buscarEmpleados(busqueda, idEmpresa)
      .pipe(finalize(() => this.buscando.set(false)))
      .subscribe({
        next: (data: CoincidenciaEmpleado[]) => {
          this.coincidencias.set(data ?? []);
        },
        error: (error: any) => {
          if (error?.status === 401) {
            this.errorMessage.set('Tu sesión expiró. Inicia sesión nuevamente.');
            return;
          }

          this.errorMessage.set('No fue posible buscar coincidencias.');
        }
      });
  }

  seleccionarEmpleado(item: CoincidenciaEmpleado): void {
    this.ignorarBusquedaProgramatica = true;

    this.form.patchValue(
      {
        busqueda: `${item.nombresEmpleado} ${item.apellidosEmpleado} - ${item.cedulaEmpleado}`
      },
      { emitEvent: false }
    );

    this.coincidencias.set([]);
    this.cargarReporte(item.cedulaEmpleado);

    queueMicrotask(() => {
      this.ignorarBusquedaProgramatica = false;
    });
  }

  cargarReporte(cedulaEmpleado: string): void {
    const idEmpresa = this.form.value.idEmpresa ?? null;

    this.loading.set(true);
    this.errorMessage.set('');

    this.reportesService.obtenerPorEmpleado(cedulaEmpleado, idEmpresa)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data: any) => {
          const normalizado: ReporteEmpleadoResultado = {
            resumen: data?.resumen ?? data?.Resumen ?? null,
            evaluaciones: data?.evaluaciones ?? data?.Evaluaciones ?? []
          };

          this.resultado.set(normalizado);

          if (!normalizado.resumen && normalizado.evaluaciones.length === 0) {
            this.errorMessage.set('La consulta no devolvió información visible para el empleado seleccionado.');
          }
        },
        error: (error: any) => {
          if (error?.status === 401) {
            this.errorMessage.set('Tu sesión expiró. Inicia sesión nuevamente.');
            return;
          }

          this.errorMessage.set('No fue posible cargar el reporte del empleado.');
        }
      });
  }

  exportarExcel(): void {
    const resultado = this.resultado();
    if (!resultado?.evaluaciones?.length) return;

    this.exporting.set(true);

    try {
      const exportData = resultado.evaluaciones.map(e => ({
      Empresa: e.empresa ?? '-',
      Cédula: e.cedulaEmpleado ?? '-',
      Evaluado: `${e.nombresEmpleado ?? ''} ${e.apellidosEmpleado ?? ''}`.trim(),
      Fecha: e.fechaEvaluacion,
      Estado: e.estado,
      Área: e.area,
      Cargo: e.cargo,
      Evaluador: e.evaluador,
      'Calificación total': e.calificacionTotal ?? '-'
    }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Reporte empleado');

      const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const cedula = resultado.resumen?.cedulaEmpleado ?? 'empleado';
      saveAs(blob, `reporte-empleado-${cedula}.xlsx`);
    } finally {
      this.exporting.set(false);
    }
  }
}