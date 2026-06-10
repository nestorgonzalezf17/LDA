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
  readonly anioInicio = signal(new Date().getFullYear());
  readonly anioFin = signal(new Date().getFullYear());

  // Rango de años seleccionables (cargado dinámicamente)
  readonly aniosDisponibles = signal<number[]>([]);

  // Datos del reporte
  readonly reportData = signal<ReportePromedio[]>([]);

  // Tooltip activo para el gráfico
  activeTooltip = signal<any | null>(null);

  // Determinar si es consulta unianual
  readonly isSingleYear = computed(() => this.anioInicio() === this.anioFin());

  // Configuración de la gráfica de barras para áreas (un solo año)
  readonly areaChartConfig = computed(() => {
    const data = this.reportData();
    if (data.length === 0) return null;

    const firstYearData = data[0];
    const areaAverages = firstYearData.promediosPorArea || [];
    if (areaAverages.length === 0) return null;

    const width = 800;
    const height = 300;
    const paddingLeft = 60;
    const paddingRight = 30;
    const paddingTop = 30;
    const paddingBottom = 60;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const colWidth = chartWidth / areaAverages.length;
    const barWidth = Math.min(40, colWidth * 0.6);

    const gridLines = [0, 2, 4, 6, 8, 10].map(val => {
      const y = height - paddingBottom - (val / 10) * chartHeight;
      return { y, value: val };
    });

    const bars = areaAverages.map((a, idx) => {
      const x = paddingLeft + idx * colWidth + (colWidth - barWidth) / 2;
      const barHeight = (a.promedio / 10) * chartHeight;
      const y = height - paddingBottom - barHeight;
      return {
        x,
        y,
        width: barWidth,
        height: barHeight,
        value: a.promedio,
        label: a.nombreArea,
        id: a.idArea
      };
    });

    return {
      width,
      height,
      paddingLeft,
      paddingBottom,
      gridLines,
      bars
    };
  });

  // Configuración de la gráfica agrupada multi-anual por áreas
  readonly multiYearAreaChartConfig = computed(() => {
    const data = this.reportData();
    if (data.length <= 1) return null;

    const years = data.map(d => d.anio);
    const areaMap = new Map<number, string>();
    data.forEach(d => {
      d.promediosPorArea.forEach(a => {
        areaMap.set(a.idArea, a.nombreArea);
      });
    });

    const uniqueAreas = Array.from(areaMap.entries()).map(([id, name]) => ({ id, name }));
    if (uniqueAreas.length === 0) return null;

    const width = 800;
    const height = 320;
    const paddingLeft = 60;
    const paddingRight = 30;
    const paddingTop = 45;
    const paddingBottom = 60;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const colWidth = chartWidth / uniqueAreas.length;
    const numYears = years.length;
    const groupWidth = colWidth * 0.8;
    const barWidth = Math.min(20, groupWidth / numYears);

    const gridLines = [0, 2, 4, 6, 8, 10].map(val => {
      const y = height - paddingBottom - (val / 10) * chartHeight;
      return { y, value: val };
    });

    const colors = [
      '#3b82f6', // Azul claro
      '#1d4ed8', // Azul medio
      '#1e3a8a', // Azul oscuro
      '#0ea5e9', // Celeste
      '#0369a1', // Celeste oscuro
      '#0f172a'  // Pizarra
    ];

    const yearColors = years.map((yr, idx) => ({
      year: yr,
      color: colors[idx % colors.length]
    }));

    const groups = uniqueAreas.map((area, areaIdx) => {
      const xStart = paddingLeft + areaIdx * colWidth + (colWidth - (numYears * barWidth)) / 2;
      const bars = years.map((yr, yrIdx) => {
        const yearData = data.find(d => d.anio === yr);
        const areaScore = yearData?.promediosPorArea.find(a => a.idArea === area.id)?.promedio || 0;

        const barHeight = (areaScore / 10) * chartHeight;
        const x = xStart + yrIdx * barWidth;
        const y = height - paddingBottom - barHeight;

        return {
          x,
          y,
          width: Math.max(2, barWidth - 2),
          height: barHeight,
          value: areaScore,
          year: yr,
          color: yearColors[yrIdx].color
        };
      });

      return {
        areaName: area.name,
        areaId: area.id,
        bars,
        centerX: paddingLeft + areaIdx * colWidth + colWidth / 2
      };
    });

    return {
      width,
      height,
      paddingLeft,
      paddingBottom,
      gridLines,
      groups,
      legend: yearColors
    };
  });

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

          const dbAnios = data.anios || [];
          const currentYear = new Date().getFullYear();
          const defaultAnios: number[] = [];
          for (let y = currentYear; y >= 2021; y--) {
            defaultAnios.push(y);
          }
          const uniqueAnios = Array.from(new Set([...dbAnios, ...defaultAnios])).sort((a, b) => b - a);
          this.aniosDisponibles.set(uniqueAnios);

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
