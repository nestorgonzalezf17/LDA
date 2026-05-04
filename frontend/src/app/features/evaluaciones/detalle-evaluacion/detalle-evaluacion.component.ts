import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { EvaluacionDetalleResponse } from '../../../core/models/evaluacion.model';
import { EvaluacionesService } from '../../../core/services/evaluaciones.service';
import { environment } from '../../../../environments/environment';

type ItemAgrupado = {
  textoItem: string;
  calificacion: number;
  comentario?: string | null;
  ordenItem: number;
};

type CompetenciaAgrupada = {
  competencia: string;
  ordenCompetencia: number;
  items: ItemAgrupado[];
};

type SeccionAgrupada = {
  seccion: string;
  ordenSeccion: number;
  competencias: CompetenciaAgrupada[];
};

@Component({
  selector: 'app-detalle-evaluacion',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './detalle-evaluacion.component.html',
  styleUrl: './detalle-evaluacion.component.scss'
})
export class DetalleEvaluacionComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly evaluacionesService = inject(EvaluacionesService);

  private routeSub?: Subscription;

  readonly detalle = signal<EvaluacionDetalleResponse | null>(null);
  readonly loading = signal(false);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));

      this.detalle.set(null);
      this.errorMessage.set('');

      if (!id) {
        this.errorMessage.set('No se pudo identificar la evaluación.');
        return;
      }

      this.cargarDetalle(id);
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    document.body.classList.remove('printing-detalle');
  }

  cargarDetalle(idEvaluacion: number): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.evaluacionesService.obtenerDetalle(idEvaluacion).subscribe({
      next: (data) => {
        this.detalle.set(data);
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);

        if (error?.status === 401) {
          this.errorMessage.set('Tu sesión expiró. Inicia sesión nuevamente.');
          return;
        }

        this.errorMessage.set('No fue posible cargar el detalle de la evaluación.');
      }
    });
  }

  respuestasAgrupadas(): SeccionAgrupada[] {
    const respuestas = this.detalle()?.respuestas ?? [];

    type SeccionAgrupadaInterna = {
      seccion: string;
      ordenSeccion: number;
      competencias: Map<string, CompetenciaAgrupada>;
    };

    const seccionesMap = new Map<string, SeccionAgrupadaInterna>();

    for (const respuesta of respuestas) {
      const nombreSeccion = respuesta.nombreSeccionSnapshot || 'Sin sección';
      const nombreCompetencia = respuesta.nombreCompetenciaSnapshot || 'Sin competencia';

      if (!seccionesMap.has(nombreSeccion)) {
        seccionesMap.set(nombreSeccion, {
          seccion: nombreSeccion,
          ordenSeccion: respuesta.ordenSeccionSnapshot ?? 9999,
          competencias: new Map<string, CompetenciaAgrupada>()
        });
      }

      const seccion = seccionesMap.get(nombreSeccion)!;

      if (!seccion.competencias.has(nombreCompetencia)) {
        seccion.competencias.set(nombreCompetencia, {
          competencia: nombreCompetencia,
          ordenCompetencia: respuesta.ordenCompetenciaSnapshot ?? 9999,
          items: []
        });
      }

      const competencia = seccion.competencias.get(nombreCompetencia)!;

      competencia.items.push({
        textoItem: respuesta.textoItem,
        calificacion: respuesta.calificacion,
        comentario: respuesta.comentario,
        ordenItem: respuesta.ordenItemSnapshot ?? 9999
      });
    }

    return Array.from(seccionesMap.values())
      .sort((a, b) => a.ordenSeccion - b.ordenSeccion)
      .map((seccion) => ({
        seccion: seccion.seccion,
        ordenSeccion: seccion.ordenSeccion,
        competencias: Array.from(seccion.competencias.values())
          .sort((a, b) => a.ordenCompetencia - b.ordenCompetencia)
          .map((competencia) => ({
            competencia: competencia.competencia,
            ordenCompetencia: competencia.ordenCompetencia,
            items: competencia.items.sort((a, b) => a.ordenItem - b.ordenItem)
          }))
      }));
  }

  resolverLogoUrl(logo: string | null | undefined): string | null {
  if (!logo) return null;

  // limpiar posibles datos viejos (opcional pero recomendado)
  if (logo.startsWith('http')) {
    const index = logo.indexOf('/uploads/');
    if (index >= 0) {
      logo = logo.substring(index + 1);
    }
  }

  // evitar doble slash
  if (logo.startsWith('/')) {
    logo = logo.substring(1);
  }

  return `${environment.assetsUrl}/${logo}`;
}
  imprimir(): void {
    if (!this.detalle()?.cabecera) return;

    this.errorMessage.set('');
    document.body.classList.add('printing-detalle');

    setTimeout(() => {
      window.print();

      setTimeout(() => {
        document.body.classList.remove('printing-detalle');
      }, 600);
    }, 150);
  }
}