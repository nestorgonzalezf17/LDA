import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import * as XLSX from 'xlsx';
import { LdaService, NotificacionDto, TipoCarga, NotificacionSaveDto } from '../../../core/services/lda.service';

@Component({
  selector: 'app-listado-notificaciones',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './listado-notificaciones.component.html',
  styleUrl: './listado-notificaciones.component.scss'
})
export class ListadoNotificacionesComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly ldaService = inject(LdaService);

  readonly tiposCarga = signal<TipoCarga[]>([]);
  readonly notificaciones = signal<NotificacionDto[]>([]);

  readonly loadingCatalogos = signal(false);
  readonly loadingNotificaciones = signal(false);
  readonly downloadingId = signal<number | null>(null);

  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  filtrosForm = this.fb.group({
    cedulaEmpleado: [''],
    idTipoCarga: [null as number | null],
    placa: [''],
    operacion: [''],
    fechaHecho: [''],
    fechaNotificacion: ['']
  });

  readonly hasResultados = computed(() => this.notificaciones().length > 0);

  ngOnInit(): void {
    this.cargarCatalogos();
    this.buscar();
  }

  cargarCatalogos(): void {
    this.loadingCatalogos.set(true);
    this.ldaService.listarTiposCarga()
      .pipe(finalize(() => this.loadingCatalogos.set(false)))
      .subscribe({
        next: (data) => this.tiposCarga.set(data),
        error: () => this.errorMessage.set('No fue posible cargar los catálogos de tipos de carga.')
      });
  }

  buscar(): void {
    this.loadingNotificaciones.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const formValues = this.filtrosForm.value;
    const filtros: any = {};

    if (formValues.cedulaEmpleado) filtros.cedulaEmpleado = formValues.cedulaEmpleado;
    if (formValues.idTipoCarga) filtros.idTipoCarga = formValues.idTipoCarga;
    if (formValues.placa) filtros.placa = formValues.placa;
    if (formValues.operacion) filtros.operacion = formValues.operacion;
    if (formValues.fechaHecho) filtros.fechaHecho = formValues.fechaHecho;
    if (formValues.fechaNotificacion) filtros.fechaNotificacion = formValues.fechaNotificacion;

    this.ldaService.listar(filtros)
      .pipe(finalize(() => this.loadingNotificaciones.set(false)))
      .subscribe({
        next: (data) => this.notificaciones.set(data),
        error: (error) => {
          if (error?.status === 401) {
            this.errorMessage.set('Tu sesión expiró. Inicia sesión nuevamente.');
            return;
          }
          this.errorMessage.set('No fue posible cargar el listado de llamados de atención.');
        }
      });
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset({
      cedulaEmpleado: '',
      idTipoCarga: null,
      placa: '',
      operacion: '',
      fechaHecho: '',
      fechaNotificacion: ''
    });
    this.buscar();
  }

  descargarPdf(n: NotificacionDto): void {
    this.downloadingId.set(n.idNotificacion);
    this.errorMessage.set('');
    this.successMessage.set('');

    const dto: NotificacionSaveDto = {
      cedulaEmpleado: n.cedulaEmpleado,
      nombreCompletoEmpleado: n.nombreCompletoEmpleado,
      placaVehiculoAsignado: n.placaVehiculoAsignado,
      idRelacionHecho: n.idRelacionHecho,
      idTipoCarga: n.idTipoCarga,
      operacion: n.operacion ?? '',
      fechaHecho: n.fechaHecho,
      registro: n.registro ?? ''
    };

    this.ldaService.previsualizar(dto)
      .pipe(finalize(() => this.downloadingId.set(null)))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Llamado_Atencion_${n.cedulaEmpleado}_${n.fechaNotificacion.substring(0, 10)}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          this.successMessage.set('PDF descargado correctamente.');
        },
        error: (err) => {
          console.error('Error al descargar PDF:', err);
          this.errorMessage.set('No se pudo generar o descargar el archivo PDF.');
        }
      });
  }

  exportarAExcel(): void {
    if (this.notificaciones().length === 0) {
      this.errorMessage.set('No hay datos disponibles para exportar.');
      return;
    }

    const dataToExport = this.notificaciones().map(n => ({
      'Cédula': n.cedulaEmpleado,
      'Nombre Empleado': n.nombreCompletoEmpleado,
      'Placa Vehículo': n.placaVehiculoAsignado,
      'Relación del Hecho': n.tituloRelacionHecho,
      'Tipo de Carga': n.tituloTipoCarga,
      'Operación': n.operacion || '',
      'Fecha del Hecho': n.fechaHecho ? new Date(n.fechaHecho).toLocaleDateString() : '',
      'Fecha de Notificación': n.fechaNotificacion ? new Date(n.fechaNotificacion).toLocaleDateString() : '',
      'Registro/Bitácora': n.registro || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Llamados de Atención');

    // Auto-fit column widths
    const max_width = dataToExport.reduce((w, r) => {
      Object.keys(r).forEach((key) => {
        const val = r[key as keyof typeof r] || '';
        w[key] = Math.max(w[key] || 10, val.toString().length + 2);
      });
      return w;
    }, {} as { [key: string]: number });
    
    worksheet['!cols'] = Object.keys(max_width).map(k => ({ wch: Math.min(50, max_width[k]) }));

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });

    // Download file
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Llamados_Atencion_${new Date().toISOString().substring(0, 10)}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    this.successMessage.set('Excel descargado correctamente.');
  }

  irANuevo(): void {
    this.router.navigate(['/lda/nuevo']);
  }
}
