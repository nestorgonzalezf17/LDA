import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Empresa } from '../../../core/models/empresa.model';
import { EmpresaService } from '../../../core/services/empresa.service';
import { ReportesService } from '../../../core/services/reportes.service';

type ReporteAreaRow = {
  empresa?: string | null;
  area: string;
  totalEvaluaciones: number;
  totalFinalizadas: number;
  totalEnElaboracion: number;
  promedioCalificacion?: number | null;
};

@Component({
  selector: 'app-reporte-areas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reporte-areas.component.html',
  styleUrl: './reporte-areas.component.scss'
})
export class ReporteAreasComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly empresaService = inject(EmpresaService);
  private readonly reportesService = inject(ReportesService);

  readonly empresas = signal<Empresa[]>([]);
  readonly rawData = signal<ReporteAreaRow[]>([]);
  readonly loading = signal(false);
  readonly loadingEmpresas = signal(false);
  readonly exporting = signal(false);
  readonly errorMessage = signal('');

  form = this.fb.group({
    idEmpresa: [null as number | null]
  });

  readonly data = computed(() => {
    const rows = this.rawData();
    const idEmpresa = this.form.value.idEmpresa ?? null;

    if (!idEmpresa) return rows;

    const empresaSeleccionada = this.empresas().find(x => x.idEmpresa === idEmpresa);
    if (!empresaSeleccionada) return rows;

    const nombreEmpresa = (empresaSeleccionada.nombre ?? '').trim().toUpperCase();

    return rows.filter(x => (x.empresa ?? '').trim().toUpperCase() === nombreEmpresa);
  });

  readonly resumen = computed(() => {
    const rows = this.data();
    const rowsConPromedio = rows.filter(x => x.promedioCalificacion != null);

    return {
      totalAreas: rows.length,
      totalEvaluaciones: rows.reduce((acc, x) => acc + (x.totalEvaluaciones || 0), 0),
      totalFinalizadas: rows.reduce((acc, x) => acc + (x.totalFinalizadas || 0), 0),
      promedioGeneral: rowsConPromedio.length
        ? (
            rowsConPromedio.reduce((acc, x) => acc + Number(x.promedioCalificacion || 0), 0) /
            rowsConPromedio.length
          ).toFixed(2)
        : '-'
    };
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
        next: (data: Empresa[]) => {
          this.empresas.set(data.filter(x => x.activo));
          this.cargar();
        },
        error: (_error: unknown) => {
          this.errorMessage.set('No fue posible cargar las empresas.');
        }
      });
  }

  onEmpresaChange(): void {
    // El filtro se recalcula automáticamente por computed()
  }

  cargar(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.reportesService.obtenerPorArea(true, this.form.value.idEmpresa ?? null)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data: ReporteAreaRow[]) => {
          this.rawData.set(data ?? []);
        },
        error: (error: any) => {
          if (error?.status === 401) {
            this.errorMessage.set('Tu sesión expiró. Inicia sesión nuevamente.');
            return;
          }

          this.errorMessage.set('No fue posible cargar el reporte por área.');
        }
      });
  }

  exportarExcel(): void {
    const rows = this.data();
    if (!rows.length) return;

    this.exporting.set(true);

    try {
      const exportData = rows.map(row => ({
        Empresa: row.empresa ?? '-',
        Área: row.area,
        'Total evaluaciones': row.totalEvaluaciones,
        Finalizadas: row.totalFinalizadas,
        'En elaboración': row.totalEnElaboracion,
        'Promedio calificación': row.promedioCalificacion ?? '-'
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Reporte por área');

      const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      saveAs(blob, `reporte-areas-${new Date().toISOString().slice(0, 10)}.xlsx`);
    } finally {
      this.exporting.set(false);
    }
  }
}