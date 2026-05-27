import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EdsService, EdsCatalogos, CatalogoItem } from '../../../core/services/eds.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-formulario-eds',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './formulario.component.html',
  styleUrl: './formulario.component.css'
})
export class FormularioComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly edsService = inject(EdsService);

  form: FormGroup;
  cedula = signal('');
  nombre = signal('');

  loading = signal(true);
  errorMessage = signal('');

  // Listas para Dropdowns
  estadosCiviles = signal<CatalogoItem[]>([]);
  escolaridades = signal<CatalogoItem[]>([]);
  areas = signal<CatalogoItem[]>([]);
  empresas = signal<CatalogoItem[]>([]);

  constructor() {
    // Obtener parámetros de navegación anteriores
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { cedula: string; nombre: string };

    if (!state || !state.cedula) {
      // Redirigir al inicio si se ingresa de forma directa
      this.router.navigate(['/eds/identificacion']);
    } else {
      this.cedula.set(state.cedula);
      this.nombre.set(state.nombre);
    }

    this.form = this.fb.group({
      cargo: ['', [Validators.required]],
      edad: ['', [Validators.required, Validators.min(18), Validators.max(100)]],
      idEstadoCivil: ['', [Validators.required]],
      idEscolaridad: ['', [Validators.required]],
      idArea: ['', [Validators.required]],
      idEmpresa: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.cargarCatalogos();
  }

  cargarCatalogos(): void {
    this.loading.set(true);
    this.edsService.obtenerCatalogos()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => {
          this.estadosCiviles.set(data.estadosCiviles);
          this.escolaridades.set(data.escolaridades);
          this.areas.set(data.areas);
          this.empresas.set(data.empresas);
        },
        error: () => {
          this.errorMessage.set('Error al cargar la información requerida del formulario.');
        }
      });
  }

  enviar(): void {
    if (this.form.invalid) return;

    const datosFormulario = {
      cedula: this.cedula(),
      nombre: this.nombre(),
      ...this.form.value
    };

    // Redirección al componente de la evaluación pasándole toda la información
    this.router.navigate(['/eds/proceso'], { state: datosFormulario });
  }
}
