import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EdsService, CatalogoItem } from '../../../core/services/eds.service';
import { finalize } from 'rxjs';

interface ReportePromedio {
  anio: number;
  promedioGeneral: number;
  promediosPorInstrumento: { idInst: number; nombreInstrumento: string; promedio: number }[];
  promediosPorArea: { idArea: number; nombreArea: string; promedio: number }[];
}

@Component({
  selector: 'app-dashboard-eds',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-eds.component.html',
  styleUrl: './dashboard-eds.component.css'
})
export class DashboardEdsComponent implements OnInit {
  private readonly edsService = inject(EdsService);

  readonly loadingCatalogos = signal(false);
  readonly loadingReport = signal(false);
  readonly errorMessage = signal('');

  // Catálogos
  readonly areas = signal<CatalogoItem[]>([]);
  readonly instrumentos = signal<CatalogoItem[]>([]);

  // Filtros seleccionados
  readonly selectedAreas = signal<number[]>([]);
  readonly selectedInstrument = signal<number | null>(null);
  readonly anioInicio = signal(2023);
  readonly anioFin = signal(new Date().getFullYear());

  // Rango de años seleccionables
  readonly aniosDisponibles = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);

  // Datos del reporte
  readonly reportData = signal<ReportePromedio[]>([]);

  // Tooltip activo para el gráfico
  activeTooltip = signal<any | null>(null);

  // Computed signals para el gráfico SVG
  readonly chartConfig = computed(() => {
    const data = this.reportData();
    if (data.length === 0) return null;

    const width = 800;
    const height = 300;
    const paddingLeft = 50;
    const paddingRight = 30;
    const paddingTop = 30;
    const paddingBottom = 40;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    // Calcular ejes y barras
    const spacing = data.length > 1 ? chartWidth / (data.length - 1) : chartWidth;
    
    // Generar líneas de cuadrícula para Y (del 0 al 10, cada 2 puntos)
    const gridLines = [0, 2, 4, 6, 8, 10].map(val => {
      const y = height - paddingBottom - (val / 10) * chartHeight;
      return { y, value: val };
    });

    // Generar puntos para la línea de tendencia general
    const points = data.map((d, idx) => {
      const x = paddingLeft + idx * spacing;
      const y = height - paddingBottom - (d.promedioGeneral / 10) * chartHeight;
      return { x, y, value: d.promedioGeneral, year: d.anio, data: d };
    });

    // Generar barras para los promedios
    const bars = data.map((d, idx) => {
      const x = paddingLeft + idx * spacing;
      const val = d.promedioGeneral;
      const barHeight = (val / 10) * chartHeight;
      const y = height - paddingBottom - barHeight;
      return {
        x,
        y,
        width: 34,
        height: barHeight,
        value: val,
        year: d.anio,
        data: d
      };
    });

    // Generar caminos (path d attribute) para la línea de tendencia
    let linePath = '';
    if (points.length > 0) {
      linePath = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        linePath += ` L ${points[i].x} ${points[i].y}`;
      }
    }

    return {
      width,
      height,
      paddingLeft,
      paddingBottom,
      gridLines,
      points,
      bars,
      linePath
    };
  });

  ngOnInit(): void {
    this.cargarCatalogos();
  }

  cargarCatalogos(): void {
    this.loadingCatalogos.set(true);
    this.edsService.obtenerCatalogos()
      .pipe(finalize(() => this.loadingCatalogos.set(false)))
      .subscribe({
        next: (data) => {
          this.areas.set(data.areas || []);
          this.instrumentos.set(data.instrumentos || []);
          this.cargarReporte();
        },
        error: () => {
          this.errorMessage.set('No fue posible cargar las áreas e instrumentos.');
        }
      });
  }

  cargarReporte(): void {
    this.loadingReport.set(true);
    this.errorMessage.set('');

    const filtro = {
      idAreas: this.selectedAreas(),
      idInst: this.selectedInstrument(),
      anioInicio: this.anioInicio(),
      anioFin: this.anioFin()
    };

    this.edsService.obtenerReportePromedios(filtro)
      .pipe(finalize(() => this.loadingReport.set(false)))
      .subscribe({
        next: (data) => {
          this.reportData.set(data || []);
        },
        error: (err) => {
          this.errorMessage.set(err.error?.mensaje || 'Error al obtener el reporte de promedios.');
        }
      });
  }

  toggleArea(idArea: number): void {
    this.selectedAreas.update(current => {
      if (current.includes(idArea)) {
        return current.filter(id => id !== idArea);
      } else {
        return [...current, idArea];
      }
    });
    this.cargarReporte();
  }

  clearAreas(): void {
    this.selectedAreas.set([]);
    this.cargarReporte();
  }

  selectInstrument(idInst: number | null): void {
    this.selectedInstrument.set(idInst);
    this.cargarReporte();
  }

  changeAnioInicio(event: Event): void {
    const val = Number((event.target as HTMLSelectElement).value);
    this.anioInicio.set(val);
    if (val > this.anioFin()) {
      this.anioFin.set(val);
    }
    this.cargarReporte();
  }

  changeAnioFin(event: Event): void {
    const val = Number((event.target as HTMLSelectElement).value);
    this.anioFin.set(val);
    if (val < this.anioInicio()) {
      this.anioInicio.set(val);
    }
    this.cargarReporte();
  }

  mostrarTooltip(tooltipData: any): void {
    this.activeTooltip.set(tooltipData);
  }

  ocultarTooltip(): void {
    this.activeTooltip.set(null);
  }

  calculatePeriodAverage(): string {
    const data = this.reportData();
    if (data.length === 0) return '-';
    const sum = data.reduce((acc, x) => acc + x.promedioGeneral, 0);
    return (sum / data.length).toFixed(2);
  }

  getBestYear(): { year: number; value: number } | null {
    const data = this.reportData();
    if (data.length === 0) return null;
    let best = data[0];
    for (let i = 1; i < data.length; i++) {
      if (data[i].promedioGeneral > best.promedioGeneral) {
        best = data[i];
      }
    }
    return { year: best.anio, value: best.promedioGeneral };
  }
}
