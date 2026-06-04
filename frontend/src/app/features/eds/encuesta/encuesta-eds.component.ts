import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EdsService } from '../../../core/services/eds.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-encuesta-eds',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './encuesta-eds.component.html',
  styleUrl: './encuesta-eds.component.css'
})
export class EncuestaComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly edsService = inject(EdsService);

  idFormulario = signal<number | null>(null);
  cedula = signal('');
  nombre = signal('');

  loading = signal(true);
  errorMessage = signal('');

  // Estructura de la encuesta jerárquica
  encuestaTree = signal<any>(null);
  nombresInstrumentos = signal<string[]>([]);
  pasoActual = signal(0); // Índice del instrumento actual

  // Respuestas del colaborador: clave "IdItem" (número) -> valor "Calificación (1 a 10)"
  respuestas = new Map<number, number>();

  saveSuccess = signal(false);

  constructor() {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { idFormulario: number; cedula: string; nombre: string };

    if (!state || !state.cedula) {
      // Redirigir al inicio si se ingresa de forma directa sin identificación
      this.router.navigate(['/eds/identificacion']);
    } else {
      this.idFormulario.set(state.idFormulario);
      this.cedula.set(state.cedula);
      this.nombre.set(state.nombre);
    }
  }

  ngOnInit(): void {
    this.cargarEncuesta();
  }

  cargarEncuesta(): void {
    this.loading.set(true);
    this.edsService.obtenerArbolCompleto().subscribe({
      next: (data) => {
        this.encuestaTree.set(data);
        this.nombresInstrumentos.set(Object.keys(data));

        const formId = this.idFormulario();
        if (formId) {
          // Pre-cargar respuestas guardadas previamente en la base de datos
          this.edsService.obtenerRespuestas(formId)
            .pipe(finalize(() => this.loading.set(false)))
            .subscribe({
              next: (respuestasGuardadas) => {
                if (respuestasGuardadas && respuestasGuardadas.length > 0) {
                  respuestasGuardadas.forEach(r => {
                    this.respuestas.set(r.idItem, r.calificacion);
                  });
                }
              },
              error: (err) => {
                console.error('Error al pre-cargar respuestas previas:', err);
              }
            });
        } else {
          this.loading.set(false);
        }
      },
      error: (err) => {
        console.error('Error al cargar la estructura de la encuesta:', err);
        this.errorMessage.set('Error al cargar las preguntas de la encuesta.');
        this.loading.set(false);
      }
    });
  }

  // Obtiene el Instrumento actual (objeto con TipoVaria)
  get instrumentoActual(): string {
    return this.nombresInstrumentos()[this.pasoActual()];
  }

  // Obtiene las TipoVaria asociadas al Instrumento actual
  get tiposVariaActuales(): string[] {
    const inst = this.instrumentoActual;
    return inst ? Object.keys(this.encuestaTree()[inst]) : [];
  }

  // Obtiene las SubVaria asociadas a una TipoVaria específica en el Instrumento actual
  getSubVarias(tipoVaria: string): string[] {
    const inst = this.instrumentoActual;
    return Object.keys(this.encuestaTree()[inst][tipoVaria]);
  }

  // Obtiene los enunciados (objetos { idItem, enunciado }) de una SubVaria en una TipoVaria
  getEnunciados(tipoVaria: string, subVaria: string): any[] {
    const inst = this.instrumentoActual;
    return this.encuestaTree()[inst][tipoVaria][subVaria];
  }

  // Asignar calificación de 1 a 10 a un enunciado
  seleccionarCalificacion(idItem: number, valor: number): void {
    this.respuestas.set(idItem, valor);
  }

  // Retorna la calificación guardada para pintar el botón en UI
  obtenerCalificacion(idItem: number): number | null {
    return this.respuestas.get(idItem) || null;
  }

  // Valida si todas las preguntas del Instrumento actual han sido respondidas
  validarInstrumentoCompleto(): boolean {
    const inst = this.instrumentoActual;
    if (!inst || !this.encuestaTree()) return false;

    const tipos = this.tiposVariaActuales;
    for (const tipo of tipos) {
      const subs = this.getSubVarias(tipo);
      for (const sub of subs) {
        const enunciados = this.getEnunciados(tipo, sub);
        for (const enun of enunciados) {
          if (!this.respuestas.has(enun.idItem)) {
            return false;
          }
        }
      }
    }
    return true;
  }

  // Guardar respuestas en la base de datos
  guardarRespuestas(silent: boolean = false): void {
    const idForm = this.idFormulario();
    if (!idForm) return;

    const respuestasPayload: { idItem: number, calificacion: number }[] = [];
    this.respuestas.forEach((valor, clave) => {
      if (valor >= 1 && valor <= 10) {
        respuestasPayload.push({ idItem: clave, calificacion: valor });
      }
    });

    this.edsService.guardarRespuestas(idForm, respuestasPayload).subscribe({
      next: () => {
        if (!silent) {
          this.saveSuccess.set(true);
          setTimeout(() => this.saveSuccess.set(false), 3000);
        }
      },
      error: (err) => {
        console.error('Error al guardar respuestas en el backend:', err);
        if (!silent) {
          this.errorMessage.set(err.error?.mensaje || 'Error al guardar tus respuestas.');
        }
      }
    });
  }

  // Navegar al siguiente Instrumento
  siguientePaso(): void {
    if (!this.validarInstrumentoCompleto()) {
      this.errorMessage.set('Por favor califica todas las preguntas del instrumento actual antes de continuar.');
      return;
    }
    
    // Guardar parcial de manera silenciosa
    this.guardarRespuestas(true);

    this.errorMessage.set('');
    if (this.pasoActual() < this.nombresInstrumentos().length - 1) {
      this.pasoActual.update(p => p + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Regresar al Instrumento anterior
  anteriorPaso(): void {
    this.errorMessage.set('');
    
    // Guardar parcial de manera silenciosa
    this.guardarRespuestas(true);

    if (this.pasoActual() > 0) {
      this.pasoActual.update(p => p - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Finalizar la Encuesta
  finalizar(): void {
    if (!this.validarInstrumentoCompleto()) {
      this.errorMessage.set('Por favor califica todas las preguntas antes de finalizar.');
      return;
    }

    const idForm = this.idFormulario();
    if (!idForm) return;

    const respuestasPayload: { idItem: number, calificacion: number }[] = [];
    this.respuestas.forEach((valor, clave) => {
      if (valor >= 1 && valor <= 10) {
        respuestasPayload.push({ idItem: clave, calificacion: valor });
      }
    });

    // Guardar respuestas finales y luego marcar el formulario como Realizada
    this.edsService.guardarRespuestas(idForm, respuestasPayload).subscribe({
      next: () => {
        this.edsService.finalizarFormulario(idForm).subscribe({
          next: () => {
            this.router.navigate(['/eds/encuesta/terminada']);
          },
          error: (err) => {
            this.errorMessage.set(err.error?.mensaje || 'Error al completar la finalización de tu encuesta.');
          }
        });
      },
      error: (err) => {
        this.errorMessage.set(err.error?.mensaje || 'Error al guardar tus respuestas finales.');
      }
    });
  }
}
