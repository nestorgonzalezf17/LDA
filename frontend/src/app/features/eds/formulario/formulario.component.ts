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
    const state = navigation?.extras.state as { 
      cedula: string; 
      nombre: string;
      formularioAnterior?: {
        cargo: string;
        fechaDeNacimiento: string;
        idEstadoCivil: number;
        idestadoCivil: number;
        idEscolaridad: number;
        idArea: number;
        idEmpresa: number;
        idempresa: number;
      }
    };

    if (!state || !state.cedula) {
      // Redirigir al inicio si se ingresa de forma directa
      this.router.navigate(['/eds/identificacion']);
    } else {
      this.cedula.set(state.cedula);
      this.nombre.set(state.nombre);
    }

    const fa = state?.formularioAnterior;
    this.form = this.fb.group({
      cargo: [fa?.cargo || '', [Validators.required]],
      fechaDeNacimiento: [fa?.fechaDeNacimiento ? fa.fechaDeNacimiento.split('T')[0] : '', [Validators.required, this.validarMayoriaEdad.bind(this)]],
      idEstadoCivil: [fa?.idEstadoCivil || fa?.idestadoCivil || '', [Validators.required]],
      idEscolaridad: [fa?.idEscolaridad || '', [Validators.required]],
      idArea: [fa?.idArea || '', [Validators.required]],
      idEmpresa: [fa?.idEmpresa || fa?.idempresa || '', [Validators.required]]
    });
  }

  validarMayoriaEdad(control: any) {
    if (!control.value) return null;
    const fechaNac = new Date(control.value);
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }
    return edad >= 16 ? null : { menorDeEdad: true };
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

    this.loading.set(true);
    this.errorMessage.set('');

    const payload = {
      cedula: this.cedula(),
      cargo: this.form.value.cargo,
      fechaDeNacimiento: this.form.value.fechaDeNacimiento,
      idEstadoCivil: Number(this.form.value.idEstadoCivil),
      idEscolaridad: Number(this.form.value.idEscolaridad),
      idArea: Number(this.form.value.idArea),
      idEmpresa: Number(this.form.value.idEmpresa)
    };

    this.edsService.guardarFormulario(payload)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => {
          // El backend nos retorna el objeto FormularioSaveResultDto con idFormulario
          const datosNavigation = {
            idFormulario: res.idFormulario,
            cedula: this.cedula(),
            nombre: this.nombre(),
            cargo: res.cargo,
            fechaDeNacimiento: res.fechaDeNacimiento,
            idEstadoCivil: res.idEstadoCivil,
            idEscolaridad: res.idEscolaridad,
            idArea: res.idArea,
            idEmpresa: res.idEmpresa,
            mensaje: res.mensaje,
            yaRegistrado: res.yaRegistrado
          };

          // Redirección al componente de la evaluación pasándole toda la información
          this.router.navigate(['/eds/encuesta'], { state: datosNavigation });
        },
        error: (err) => {
          this.errorMessage.set(err.error?.mensaje || 'Ocurrió un error al guardar tus datos sociodemográficos.');
        }
      });
  }
}
