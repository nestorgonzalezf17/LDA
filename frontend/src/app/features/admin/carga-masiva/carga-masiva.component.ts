import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { saveAs } from 'file-saver';
import {
  CargaMasivaPreviewResponse,
  CargaMasivaResultado
} from '../../../core/models/carga-masiva.model';
import { CargaMasivaService } from '../../../core/services/carga-masiva.service';

@Component({
  selector: 'app-carga-masiva',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carga-masiva.component.html',
  styleUrl: './carga-masiva.component.scss'
})
export class CargaMasivaComponent {
  private readonly cargaMasivaService = inject(CargaMasivaService);

  readonly archivoSeleccionado = signal<File | null>(null);
  readonly preview = signal<CargaMasivaPreviewResponse | null>(null);
  readonly resultado = signal<CargaMasivaResultado | null>(null);

  readonly loadingPlantilla = signal(false);
  readonly loadingPreview = signal(false);
  readonly loadingImportar = signal(false);

  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0] ?? null;

    this.archivoSeleccionado.set(archivo);
    this.preview.set(null);
    this.resultado.set(null);
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  descargarPlantilla(): void {
    this.loadingPlantilla.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.cargaMasivaService.descargarPlantilla()
      .pipe(finalize(() => this.loadingPlantilla.set(false)))
      .subscribe({
        next: (blob) => {
          saveAs(blob, 'plantilla-carga-masiva.xlsx');
        },
        error: () => {
          this.errorMessage.set('No fue posible descargar la plantilla.');
        }
      });
  }

  generarPreview(): void {
    const archivo = this.archivoSeleccionado();

    if (!archivo) {
      this.errorMessage.set('Debes seleccionar un archivo Excel.');
      return;
    }

    this.loadingPreview.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.preview.set(null);
    this.resultado.set(null);

    this.cargaMasivaService.preview(archivo)
      .pipe(finalize(() => this.loadingPreview.set(false)))
      .subscribe({
        next: (data) => {
          this.preview.set(data);
          if (data.filasConError === 0) {
            this.successMessage.set('Vista previa generada correctamente. El archivo está listo para importar.');
          }
        },
        error: (error) => {
          if (error?.status === 401) {
            this.errorMessage.set('Tu sesión expiró. Inicia sesión nuevamente.');
            return;
          }

          const mensaje =
            error?.error?.message ||
            error?.error?.mensaje ||
            'No fue posible generar la vista previa del archivo.';

          this.errorMessage.set(typeof mensaje === 'string' ? mensaje : 'No fue posible generar la vista previa del archivo.');
        }
      });
  }

  importar(): void {
    const archivo = this.archivoSeleccionado();
    const preview = this.preview();

    if (!archivo) {
      this.errorMessage.set('Debes seleccionar un archivo Excel.');
      return;
    }

    if (!preview) {
      this.errorMessage.set('Primero debes generar la vista previa.');
      return;
    }

    if (preview.filasConError > 0) {
      this.errorMessage.set('No se puede importar mientras existan filas con error en la vista previa.');
      return;
    }

    this.loadingImportar.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.resultado.set(null);

    this.cargaMasivaService.importar(archivo)
      .pipe(finalize(() => this.loadingImportar.set(false)))
      .subscribe({
        next: (data) => {
          this.resultado.set(data);
          this.successMessage.set('La importación fue ejecutada correctamente.');
        },
        error: (error) => {
          if (error?.status === 401) {
            this.errorMessage.set('Tu sesión expiró. Inicia sesión nuevamente.');
            return;
          }

          const mensaje =
            error?.error?.message ||
            error?.error?.mensaje ||
            'No fue posible ejecutar la importación.';

          this.errorMessage.set(typeof mensaje === 'string' ? mensaje : 'No fue posible ejecutar la importación.');
        }
      });
  }

  limpiar(): void {
    this.archivoSeleccionado.set(null);
    this.preview.set(null);
    this.resultado.set(null);
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  nombreArchivo(): string {
    return this.archivoSeleccionado()?.name ?? 'Ningún archivo seleccionado';
  }
}