import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { DashboardResponse } from '../../core/models/dashboard.model';
import { Empresa } from '../../core/models/empresa.model';
import { DashboardService } from '../../core/services/dashboard.service';
import { EmpresaService } from '../../core/services/empresa.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink, ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dashboardService = inject(DashboardService);
  private readonly empresaService = inject(EmpresaService);

  readonly loading = signal(false);
  readonly loadingEmpresas = signal(false);
  readonly errorMessage = signal('');
  readonly dashboard = signal<DashboardResponse | null>(null);
  readonly empresas = signal<Empresa[]>([]);

  form = this.fb.group({
    idEmpresa: [null as number | null]
  });

  ngOnInit(): void {
    this.cargarEmpresas();
  }

  cargarEmpresas(): void {
    this.loadingEmpresas.set(true);
    this.errorMessage.set('');

    this.empresaService.listar()
      .pipe(finalize(() => this.loadingEmpresas.set(false)))
      .subscribe({
        next: (data: Empresa[]) => {
          this.empresas.set(data.filter(x => x.activo));
          this.cargarDashboard();
        },
        error: () => {
          this.errorMessage.set('No fue posible cargar las empresas.');
        }
      });
  }

  onEmpresaChange(): void {
    this.cargarDashboard();
  }

  cargarDashboard(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.dashboardService.obtener(this.form.value.idEmpresa ?? null)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => this.dashboard.set(data),
        error: () => this.errorMessage.set('No fue posible cargar el dashboard.')
      });
  }
}