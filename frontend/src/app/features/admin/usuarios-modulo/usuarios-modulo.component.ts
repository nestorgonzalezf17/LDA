import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { UsuarioModulo } from '../../../core/models/usuario-modulo.model';
import { UsuariosModuloService } from '../../../core/services/usuarios-modulo.service';

type RolEdd = 'ADMIN' | 'EVALUADOR';

@Component({
  selector: 'app-usuarios-modulo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usuarios-modulo.component.html',
  styleUrl: './usuarios-modulo.component.scss'
})
export class UsuariosModuloComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly usuariosService = inject(UsuariosModuloService);

  readonly usuarios = signal<UsuarioModulo[]>([]);
  readonly editingUsuario = signal<UsuarioModulo | null>(null);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly changingStateId = signal<number | null>(null);
  readonly resettingPasswordId = signal<number | null>(null);

  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  readonly isEditing = computed(() => !!this.editingUsuario());
  readonly title = computed(() =>
    this.isEditing() ? 'Editar usuario' : 'Crear usuario'
  );

  form = this.fb.group({
    documento: ['', [Validators.required]],
    nombre: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    clave: ['', [Validators.required, Validators.minLength(6)]],
    rol: ['EVALUADOR' as RolEdd, [Validators.required]],
    activo: [true]
  });

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.usuariosService.listarUsuariosModulo()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => this.usuarios.set(data),
        error: () => this.errorMessage.set('No fue posible cargar los usuarios.')
      });
  }

  editar(usuario: UsuarioModulo): void {
    this.editingUsuario.set(usuario);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.form.patchValue({
      documento: usuario.documento,
      nombre: usuario.nombre,
      email: usuario.email,
      clave: '',
      rol: (usuario.rol?.toUpperCase() as RolEdd) || 'EVALUADOR',
      activo: usuario.activo
    });

    this.form.controls.documento.disable();
    this.form.controls.nombre.disable();
    this.form.controls.email.disable();
    this.form.controls.clave.disable();
  }

  cancelarEdicion(): void {
    this.editingUsuario.set(null);

    this.form.controls.documento.enable();
    this.form.controls.nombre.enable();
    this.form.controls.email.enable();
    this.form.controls.clave.enable();

    this.form.reset({
      documento: '',
      nombre: '',
      email: '',
      clave: '',
      rol: 'EVALUADOR',
      activo: true
    });

    this.errorMessage.set('');
    this.successMessage.set('');
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const editing = this.editingUsuario();

    this.saving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    if (editing) {
      this.usuariosService.actualizarRol(editing.idUsuario, {
        rolModulo: raw.rol as RolEdd,
        activo: raw.activo ?? true
      })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.successMessage.set('Usuario actualizado correctamente.');
          this.cancelarEdicion();
          this.cargarUsuarios();
        },
        error: () => this.errorMessage.set('No fue posible actualizar el usuario.')
      });

      return;
    }

    this.usuariosService.crear({
      documento: raw.documento!.trim(),
      nombre: raw.nombre!.trim(),
      email: raw.email!.trim(),
      clave: raw.clave!.trim(),
      rol: raw.rol as RolEdd
    })
    .pipe(finalize(() => this.saving.set(false)))
    .subscribe({
      next: () => {
        this.successMessage.set('Usuario creado correctamente.');
        this.cancelarEdicion();
        this.cargarUsuarios();
      },
      error: (error) => {
        this.errorMessage.set(
          error?.error?.mensaje ||
          error?.error ||
          'No fue posible crear el usuario.'
        );
      }
    });
  }

  cambiarEstado(usuario: UsuarioModulo): void {
    const nuevoEstado = !usuario.activo;
    const accion = nuevoEstado ? 'activar' : 'inactivar';

    const confirmado = window.confirm(`¿Deseas ${accion} al usuario "${usuario.nombre}"?`);
    if (!confirmado) return;

    this.changingStateId.set(usuario.idUsuario);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.usuariosService.cambiarEstado(usuario.idUsuario, nuevoEstado)
      .pipe(finalize(() => this.changingStateId.set(null)))
      .subscribe({
        next: () => {
          this.successMessage.set(
            nuevoEstado ? 'Usuario activado correctamente.' : 'Usuario inactivado correctamente.'
          );

          if (this.editingUsuario()?.idUsuario === usuario.idUsuario) {
            this.cancelarEdicion();
          }

          this.cargarUsuarios();
        },
        error: () => this.errorMessage.set('No fue posible cambiar el estado del usuario.')
      });
  }

  resetPassword(usuario: UsuarioModulo): void {
    const nuevaClave = window.prompt(
      `Ingresa una contraseña temporal para "${usuario.nombre}". El usuario deberá cambiarla al iniciar sesión.`
    );

    if (!nuevaClave || nuevaClave.trim().length < 6) {
      this.errorMessage.set('La contraseña temporal debe tener al menos 6 caracteres.');
      return;
    }

    this.resettingPasswordId.set(usuario.idUsuario);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.usuariosService.resetPassword(usuario.idUsuario, {
      nuevaClave: nuevaClave.trim()
    })
    .pipe(finalize(() => this.resettingPasswordId.set(null)))
    .subscribe({
      next: () => {
        this.successMessage.set('Contraseña restablecida correctamente. El usuario deberá cambiarla al ingresar.');
      },
      error: () => this.errorMessage.set('No fue posible restablecer la contraseña.')
    });
  }
}