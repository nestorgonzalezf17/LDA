import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { Area } from '../../../core/models/area.model';
import { Cargo } from '../../../core/models/cargo.model';
import { Empresa } from '../../../core/models/empresa.model';
import {
  EvaluacionCreatePayload,
  EvaluacionEdicionResponse,
  EvaluacionRespuestaEdicion
} from '../../../core/models/evaluacion.model';
import { PlantillaCargoResponse, PlantillaItem } from '../../../core/models/plantilla.model';
import { AreasService } from '../../../core/services/areas.service';
import { CargosService } from '../../../core/services/cargos.service';
import { EmpresaService } from '../../../core/services/empresa.service';
import { EvaluacionesService } from '../../../core/services/evaluaciones.service';
import { PlantillaService } from '../../../core/services/plantilla.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-nueva-evaluacion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './nueva-evaluacion.component.html',
  styleUrl: './nueva-evaluacion.component.scss'
})
export class NuevaEvaluacionComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly empresaService = inject(EmpresaService);
  private readonly areasService = inject(AreasService);
  private readonly cargosService = inject(CargosService);
  private readonly evaluacionesService = inject(EvaluacionesService);
  private readonly plantillaService = inject(PlantillaService);

  readonly empresas = signal<Empresa[]>([]);
  readonly areas = signal<Area[]>([]);
  readonly cargos = signal<Cargo[]>([]);

  readonly plantilla = signal<PlantillaCargoResponse | null>(null);
  readonly respuestasEdicion = signal<EvaluacionRespuestaEdicion[]>([]);

  readonly loadingEmpresas = signal(false);
  readonly loadingAreas = signal(false);
  readonly loadingCargos = signal(false);
  readonly loadingPlantilla = signal(false);
  readonly saving = signal(false);
  readonly finalizando = signal(false);

  readonly buscandoEmpleado = signal(false);
  readonly empleadoNominaValidado = signal(false);

  readonly editingId = signal<number | null>(null);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  form = this.fb.group({
    idEmpresa: [null as number | null, [Validators.required]],
    idArea: [null as number | null, [Validators.required]],
    idCargo: [null as number | null, [Validators.required]],
    nombresEmpleado: ['', [Validators.required]],
    apellidosEmpleado: ['', [Validators.required]],
    cedulaEmpleado: ['', [Validators.required]],
    periodoEvaluado: ['1 Año', [Validators.required]],
    observaciones: ['']
  });

  readonly tienePlantilla = computed(() => !!this.plantilla());

  ngOnInit(): void {
    this.cargarEmpresas();

    this.route.queryParamMap.subscribe(params => {
      const editar = params.get('editar');

      this.errorMessage.set('');
      this.successMessage.set('');

      if (editar) {
        this.cargarEdicion(Number(editar));
      } else {
        this.editingId.set(null);
        this.respuestasEdicion.set([]);
        this.empleadoNominaValidado.set(false);
      }
    });
  }

  cargarEmpresas(): void {
    this.loadingEmpresas.set(true);
    this.errorMessage.set('');

    this.empresaService.listar()
      .pipe(finalize(() => this.loadingEmpresas.set(false)))
      .subscribe({
        next: data => {
          const activas = data.filter(x => x.activo);
          this.empresas.set(activas);
        },
        error: () => {
          this.mostrarError('No fue posible cargar las empresas.');
        }
      });
  }

  onEmpresaChange(): void {
    const idEmpresa = this.form.value.idEmpresa ?? null;

    this.form.patchValue({
      idArea: null,
      idCargo: null
    });

    this.areas.set([]);
    this.cargos.set([]);
    this.plantilla.set(null);

    if (!this.editingId()) {
      this.respuestasEdicion.set([]);
    }

    if (!idEmpresa) return;

    this.loadingAreas.set(true);
    this.errorMessage.set('');

    this.areasService.listar(idEmpresa)
      .pipe(finalize(() => this.loadingAreas.set(false)))
      .subscribe({
        next: data => {
          this.areas.set(data.filter(x => x.activo));
        },
        error: () => {
          this.mostrarError('No fue posible cargar las áreas.');
        }
      });
  }

  onAreaChange(): void {
    const idEmpresa = this.form.value.idEmpresa ?? null;
    const idArea = this.form.value.idArea ?? null;

    this.form.patchValue({ idCargo: null });
    this.cargos.set([]);
    this.plantilla.set(null);

    if (!idEmpresa || !idArea) return;

    this.loadingCargos.set(true);
    this.errorMessage.set('');

    this.cargosService.listarPorArea(idEmpresa, idArea)
      .pipe(finalize(() => this.loadingCargos.set(false)))
      .subscribe({
        next: data => {
          this.cargos.set(data.filter(x => x.activo));
        },
        error: () => {
          this.mostrarError('No fue posible cargar los cargos.');
        }
      });
  }

  onCargoChange(): void {
    this.cargarPlantilla();
  }

  onCedulaChange(): void {
    if (this.editingId()) return;

    this.empleadoNominaValidado.set(false);
    this.successMessage.set('');

    this.form.patchValue({
      nombresEmpleado: '',
      apellidosEmpleado: ''
    });
  }

  cargarPlantilla(): void {
    const idEmpresa = this.form.value.idEmpresa ?? null;
    const idArea = this.form.value.idArea ?? null;
    const idCargo = this.form.value.idCargo ?? null;

    if (!idEmpresa || !idArea || !idCargo) {
      this.plantilla.set(null);
      return;
    }

    this.loadingPlantilla.set(true);
    this.errorMessage.set('');

    this.plantillaService.obtener(idEmpresa, idArea, idCargo)
      .pipe(finalize(() => this.loadingPlantilla.set(false)))
      .subscribe({
        next: response => {
          const respuestasGuardadas = this.respuestasEdicion();

          const normalizada: PlantillaCargoResponse = {
            ...response,
            secciones: response.secciones.map(seccion => ({
              ...seccion,
              competencias: seccion.competencias.map(competencia => ({
                ...competencia,
                items: competencia.items.map((item: PlantillaItem) => {
                  const respuesta = respuestasGuardadas.find(r =>
                    (item.tipoItem === 'BASE' &&
                      r.tipoItem === 'BASE' &&
                      r.idItemBase === item.idItem) ||
                    (item.tipoItem === 'CARGO' &&
                      r.tipoItem === 'CARGO' &&
                      r.idItemCargo === item.idItem)
                  );

                  return {
                    ...item,
                    calificacion: respuesta?.calificacion ?? null,
                    comentario: respuesta?.comentario ?? null
                  };
                })
              }))
            }))
          };

          this.plantilla.set(normalizada);
        },
        error: () => {
          this.plantilla.set(null);
          this.mostrarError('No fue posible cargar la plantilla.');
        }
      });
  }

  buscarEmpleadoPorCedula(): void {
    if (this.editingId()) {
      this.mostrarError('No se puede cambiar la cédula de una evaluación ya creada.');
      return;
    }

    const cedula = (this.form.value.cedulaEmpleado || '').trim();

    this.errorMessage.set('');
    this.successMessage.set('');
    this.empleadoNominaValidado.set(false);

    this.form.patchValue({
      nombresEmpleado: '',
      apellidosEmpleado: ''
    });

    if (!cedula) {
      this.form.get('cedulaEmpleado')?.markAsTouched();
      this.mostrarError('Debes ingresar la cédula del empleado.');
      return;
    }

    this.buscandoEmpleado.set(true);

    this.evaluacionesService.buscarEmpleadoNominaPorCedula(cedula)
      .pipe(finalize(() => this.buscandoEmpleado.set(false)))
      .subscribe({
        next: empleado => {
          this.form.patchValue({
            cedulaEmpleado: empleado.cedulaEmpleado,
            nombresEmpleado: empleado.nombresEmpleado,
            apellidosEmpleado: empleado.apellidosEmpleado
          });

          this.empleadoNominaValidado.set(true);
          this.mostrarExito('Empleado validado correctamente en nómina.');
        },
        error: error => {
          this.empleadoNominaValidado.set(false);

          const mensaje =
            error?.error?.mensaje ||
            'No se puede crear la evaluación porque el empleado no existe en la base de datos de nómina, o se encuentra inactivo o retirado.';

          this.mostrarError(mensaje);
        }
      });
  }

  crearEvaluacion(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.mostrarError('Completa los campos obligatorios antes de crear la evaluación.');
      return;
    }

    if (!this.editingId() && !this.empleadoNominaValidado()) {
      this.mostrarError('Primero debes validar la cédula del empleado en nómina.');
      return;
    }

    const payload: EvaluacionCreatePayload = {
      idEmpresa: this.form.value.idEmpresa!,
      idArea: this.form.value.idArea!,
      idCargo: this.form.value.idCargo!,
      nombresEmpleado: this.form.value.nombresEmpleado!.trim(),
      apellidosEmpleado: this.form.value.apellidosEmpleado!.trim(),
      cedulaEmpleado: this.form.value.cedulaEmpleado!.trim(),
      periodoEvaluado: this.form.value.periodoEvaluado || '1 Año',
      observaciones: this.form.value.observaciones || null
    };

    this.saving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.evaluacionesService.crear(payload)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: response => {
          this.editingId.set(response.id);
          this.respuestasEdicion.set([]);
          this.empleadoNominaValidado.set(true);
          this.mostrarExito('Evaluación creada correctamente.');
        },
        error: error => {
          if (error?.status === 401) {
            this.mostrarError('Tu sesión expiró. Inicia sesión nuevamente.');
            return;
          }

          const mensaje =
            error?.error?.mensaje ||
            error?.error ||
            error?.message ||
            'No fue posible crear la evaluación.';

          this.mostrarError(
            typeof mensaje === 'string'
              ? mensaje
              : 'No fue posible crear la evaluación.'
          );
        }
      });
  }

  cargarEdicion(idEvaluacion: number): void {
    this.loadingPlantilla.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.evaluacionesService.obtenerParaEdicion(idEvaluacion)
      .subscribe({
        next: (data: EvaluacionEdicionResponse) => {
          this.editingId.set(data.idEvaluacion);
          this.respuestasEdicion.set(data.respuestas ?? []);

          this.form.patchValue({
            idEmpresa: data.idEmpresa,
            idArea: data.idArea,
            idCargo: data.idCargo,
            nombresEmpleado: data.nombresEmpleado,
            apellidosEmpleado: data.apellidosEmpleado,
            cedulaEmpleado: data.cedulaEmpleado,
            periodoEvaluado: data.periodoEvaluado || '1 Año',
            observaciones: data.observaciones || ''
          });

          this.empleadoNominaValidado.set(true);
          this.loadingAreas.set(true);

          this.areasService.listar(data.idEmpresa)
            .pipe(finalize(() => this.loadingAreas.set(false)))
            .subscribe({
              next: areas => {
                this.areas.set(
                  areas.filter(x => x.activo || x.idArea === data.idArea)
                );

                this.loadingCargos.set(true);

                this.cargosService.listarPorArea(data.idEmpresa, data.idArea)
                  .pipe(finalize(() => this.loadingCargos.set(false)))
                  .subscribe({
                    next: cargos => {
                      this.cargos.set(
                        cargos.filter(x => x.activo || x.idCargo === data.idCargo)
                      );

                      this.cargarPlantilla();
                    },
                    error: () => {
                      this.loadingPlantilla.set(false);
                      this.mostrarError('No fue posible cargar los cargos del borrador.');
                    }
                  });
              },
              error: () => {
                this.loadingPlantilla.set(false);
                this.mostrarError('No fue posible cargar las áreas del borrador.');
              }
            });
        },
        error: error => {
          this.loadingPlantilla.set(false);

          if (error?.status === 401) {
            this.mostrarError('Tu sesión expiró. Inicia sesión nuevamente.');
            return;
          }

          this.mostrarError('No fue posible cargar la evaluación para edición.');
        }
      });
  }

  totalItemsEvaluables(): number {
    const plantilla = this.plantilla();
    if (!plantilla) return 0;

    return plantilla.secciones.reduce((totalSecciones, seccion) => {
      return totalSecciones + seccion.competencias.reduce((totalCompetencias, competencia) => {
        return totalCompetencias + competencia.items.length;
      }, 0);
    }, 0);
  }

  totalItemsCalificados(): number {
    const plantilla = this.plantilla();
    if (!plantilla) return 0;

    return plantilla.secciones.reduce((totalSecciones, seccion) => {
      return totalSecciones + seccion.competencias.reduce((totalCompetencias, competencia) => {
        return totalCompetencias + competencia.items.filter(item => item.calificacion != null).length;
      }, 0);
    }, 0);
  }

  puedeFinalizar(): boolean {
    const total = this.totalItemsEvaluables();
    return total > 0 && this.totalItemsCalificados() === total;
  }

  private construirPayloadRespuestas(): EvaluacionRespuestaEdicion[] {
    const plantilla = this.plantilla();
    if (!plantilla) return [];

    return plantilla.secciones.flatMap(seccion =>
      seccion.competencias.flatMap(competencia =>
        competencia.items
          .filter(item => item.calificacion != null)
          .map(item => ({
            tipoItem: item.tipoItem,
            idItemBase: item.tipoItem === 'BASE' ? item.idItem : null,
            idItemCargo: item.tipoItem === 'CARGO' ? item.idItem : null,
            calificacion: item.calificacion!,
            comentario: item.comentario || null
          }))
      )
    );
  }

  guardarBorrador(): void {
    const idEvaluacion = this.editingId();

    if (!idEvaluacion) {
      this.crearEvaluacion();
      return;
    }

    const respuestas = this.construirPayloadRespuestas();

    this.saving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.evaluacionesService.guardarRespuestas(idEvaluacion, { respuestas })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.respuestasEdicion.set(respuestas);
          this.mostrarExito('Borrador guardado correctamente.');
        },
        error: error => {
          if (error?.status === 401) {
            this.mostrarError('Tu sesión expiró. Inicia sesión nuevamente.');
            return;
          }

          this.mostrarError('No fue posible guardar las respuestas.');
        }
      });
  }

  finalizarEvaluacion(): void {
    const idEvaluacion = this.editingId();

    if (!idEvaluacion) {
      this.mostrarError('Primero debes guardar o crear la evaluación.');
      return;
    }

    if (!this.puedeFinalizar()) {
      this.mostrarError('Debes calificar todos los ítems antes de finalizar la evaluación.');
      return;
    }

    const respuestas = this.construirPayloadRespuestas();

    this.finalizando.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.evaluacionesService.guardarRespuestas(idEvaluacion, { respuestas })
      .subscribe({
        next: () => {
          this.evaluacionesService.finalizar(idEvaluacion)
            .pipe(finalize(() => this.finalizando.set(false)))
            .subscribe({
              next: () => {
                this.mostrarExito('Evaluación finalizada correctamente.');
                this.router.navigate(['/evaluaciones/listado']);
              },
              error: error => {
                if (error?.status === 401) {
                  this.mostrarError('Tu sesión expiró. Inicia sesión nuevamente.');
                  return;
                }

                const mensaje =
                  error?.error?.mensaje ||
                  error?.error ||
                  error?.message ||
                  'No fue posible finalizar la evaluación.';

                this.mostrarError(
                  typeof mensaje === 'string'
                    ? mensaje
                    : 'No fue posible finalizar la evaluación.'
                );
              }
            });
        },
        error: error => {
          this.finalizando.set(false);

          if (error?.status === 401) {
            this.mostrarError('Tu sesión expiró. Inicia sesión nuevamente.');
            return;
          }

          this.mostrarError('No fue posible guardar las respuestas antes de finalizar.');
        }
      });
  }

  resolverLogoUrl(logo: string | null | undefined): string | null {
    if (!logo) return null;

    if (logo.startsWith('http')) {
      const index = logo.indexOf('/uploads/');
      if (index >= 0) {
        logo = logo.substring(index + 1);
      }
    }

    if (logo.startsWith('/')) {
      logo = logo.substring(1);
    }

    return `${environment.assetsUrl}/${logo}`;
  }

  private mostrarExito(mensaje: string): void {
    this.successMessage.set(mensaje);
    this.errorMessage.set('');

    setTimeout(() => {
      if (this.successMessage() === mensaje) {
        this.successMessage.set('');
      }
    }, 4000);
  }

  private mostrarError(mensaje: string): void {
    this.errorMessage.set(mensaje);
    this.successMessage.set('');

    setTimeout(() => {
      if (this.errorMessage() === mensaje) {
        this.errorMessage.set('');
      }
    }, 6000);
  }
}