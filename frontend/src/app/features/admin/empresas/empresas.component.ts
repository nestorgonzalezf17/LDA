import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { Empresa, EmpresaSaveDto } from '../../../core/models/empresa.model';
import { EmpresaService } from '../../../core/services/empresa.service';
import { UploadsService } from '../../../core/services/uploads.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-empresas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './empresas.component.html',
  styleUrl: './empresas.component.scss'
})
export class EmpresasComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly empresaService = inject(EmpresaService);
  private readonly uploadsService = inject(UploadsService);

  @ViewChild('logoFileInput') logoFileInput?: ElementRef<HTMLInputElement>;

  readonly empresas = signal<Empresa[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly uploadingLogo = signal(false);
  readonly changingStateId = signal<number | null>(null);
  readonly editingEmpresa = signal<Empresa | null>(null);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  readonly selectedLogoFile = signal<File | null>(null);
  readonly selectedLogoFileName = signal<string>('');

  readonly isEditing = computed(() => !!this.editingEmpresa());
  readonly title = computed(() => this.isEditing() ? 'Editar empresa' : 'Nueva empresa');

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(150)]],
    logoUrl: ['', [Validators.maxLength(500)]],
    activo: [true]
  });

  ngOnInit(): void {
    this.cargarEmpresas();
  }

  cargarEmpresas(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.empresaService.listar()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => this.empresas.set(data),
        error: () => this.errorMessage.set('No fue posible cargar las empresas.')
      });
  }

  editar(empresa: Empresa): void {
    this.editingEmpresa.set(empresa);
    this.limpiarSeleccionLogo();

    this.errorMessage.set('');
    this.successMessage.set('');

    this.form.patchValue({
      nombre: empresa.nombre,
      logoUrl: empresa.logoUrl ?? '',
      activo: empresa.activo
    });
  }

  cancelarEdicion(): void {
    this.editingEmpresa.set(null);
    this.limpiarSeleccionLogo();

    this.form.reset({
      nombre: '',
      logoUrl: '',
      activo: true
    });

    this.errorMessage.set('');
    this.successMessage.set('');
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.selectedLogoFile.set(file);
    this.selectedLogoFileName.set(file?.name ?? '');

    if (!file) {
      return;
    }

    const allowed = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowed.includes(file.type)) {
      this.errorMessage.set('Solo se permiten logos PNG, JPG, JPEG o WEBP.');
      this.selectedLogoFile.set(null);
      this.selectedLogoFileName.set('');
      input.value = '';
      return;
    }

    this.errorMessage.set('');
  }

  subirLogo(): void {
  const file = this.selectedLogoFile();
  const empresa = this.editingEmpresa();

  if (!file) {
    this.errorMessage.set('Debes seleccionar un archivo de logo.');
    return;
  }

  if (!empresa) {
    this.errorMessage.set('Debes guardar la empresa antes de subir el logo.');
    return;
  }

  this.uploadingLogo.set(true);
  this.errorMessage.set('');
  this.successMessage.set('');

  this.empresaService.subirLogo(empresa.idEmpresa, file)
    .pipe(finalize(() => this.uploadingLogo.set(false)))
    .subscribe({
      next: (res: any) => {
        this.form.patchValue({
          logoUrl: res.logoUrl // 🔥 CORRECTO
        });

        this.successMessage.set('Logo cargado correctamente.');
      },
      error: (error: any) => {
        const mensaje =
          error?.error?.mensaje ||
          error?.error ||
          'No fue posible subir el logo.';
        this.errorMessage.set(typeof mensaje === 'string' ? mensaje : 'No fue posible subir el logo.');
      }
    });
}

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const payload: EmpresaSaveDto = {
      nombre: this.form.value.nombre?.trim() ?? '',
      logoUrl: (this.form.value.logoUrl?.trim() || null),
      activo: !!this.form.value.activo
    };

    const request$ = this.isEditing()
      ? this.empresaService.actualizar(this.editingEmpresa()!.idEmpresa, payload)
      : this.empresaService.crear(payload);

    request$
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.successMessage.set(
            this.isEditing()
              ? 'Empresa actualizada correctamente.'
              : 'Empresa creada correctamente.'
          );

          this.cancelarEdicion();
          this.cargarEmpresas();
        },
        error: (error: any) => {
          this.errorMessage.set(this.obtenerMensajeError(error));
        }
      });
  }

  cambiarEstado(empresa: Empresa): void {
    const accion = empresa.activo ? 'inactivar' : 'activar';
    const confirmado = window.confirm(`¿Deseas ${accion} la empresa "${empresa.nombre}"?`);
    if (!confirmado) return;

    this.changingStateId.set(empresa.idEmpresa);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.empresaService.cambiarEstado(empresa.idEmpresa, !empresa.activo)
      .pipe(finalize(() => this.changingStateId.set(null)))
      .subscribe({
        next: () => {
          this.successMessage.set(
            empresa.activo
              ? 'Empresa inactivada correctamente.'
              : 'Empresa activada correctamente.'
          );

          if (this.editingEmpresa()?.idEmpresa === empresa.idEmpresa) {
            this.cancelarEdicion();
          }

          this.cargarEmpresas();
        },
        error: () => {
          this.errorMessage.set('No fue posible cambiar el estado de la empresa.');
        }
      });
  }

  private limpiarSeleccionLogo(): void {
    this.selectedLogoFile.set(null);
    this.selectedLogoFileName.set('');

    if (this.logoFileInput?.nativeElement) {
      this.logoFileInput.nativeElement.value = '';
    }
  }

  private obtenerMensajeError(error: any): string {
    const raw =
      error?.error?.mensaje ||
      error?.error ||
      error?.message ||
      '';

    const text = typeof raw === 'string' ? raw : JSON.stringify(raw);

    if (text.includes('Ya existe una empresa con ese nombre')) {
      return 'Ya existe una empresa con ese nombre.';
    }

    if (text.includes('Ya existe otra empresa con ese nombre')) {
      return 'Ya existe otra empresa con ese nombre.';
    }

    if (text.includes('duplicate') || text.includes('duplicada')) {
      return 'Ya existe una empresa con ese nombre.';
    }

    return 'No fue posible guardar la empresa.';
  }
  
resolverLogoUrl(logo?: string | null): string | null {
  if (!logo) return null;
  return `${environment.assetsUrl}/${logo}`;
}

}