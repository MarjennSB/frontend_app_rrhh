import { Component, inject, OnInit, signal, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { IncidentService } from '../../../core/services/incident.service';
import { IncidentTypeService } from '../../../core/services/catalogs/incident-type.service';

declare const bootstrap: any;

@Component({
  selector: 'app-incidents-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './incidents-modal.html',
})
export class IncidentsModalComponent implements OnInit, OnChanges {
  @Input() personalId: number | null = null;

  private readonly incidentService = inject(IncidentService);
  private readonly incidentTypeService = inject(IncidentTypeService);
  private readonly fb = inject(FormBuilder);

  incidents = signal<any[]>([]);
  availableTypes = signal<any[]>([]);
  
  isLoading = signal(false);
  errorMsg = signal<string | null>(null);
  successMsg = signal<string | null>(null);

  isEditing = signal(false);
  editingId = signal<number | null>(null);

  readonly form = this.fb.nonNullable.group({
    personal_id: [0, [Validators.required, Validators.min(1)]],
    incident_type_id: [0, [Validators.required, Validators.min(1)]],
    start_date: ['', [Validators.required]],
    end_date: [''],
    description: [''],
    status: [true]
  });

  private modalInstance: any;

  ngOnInit(): void {
    this.loadCatalogs();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['personalId'] && this.personalId !== null) {
      this.loadIncidents();
    }
  }

  getModal(): any {
    if (!this.modalInstance) {
      const el = document.getElementById('incidentFormModal');
      if (el) {
        this.modalInstance = new bootstrap.Modal(el);
      }
    }
    return this.modalInstance;
  }

  loadCatalogs(): void {
    this.incidentTypeService.getAll().subscribe({
      next: (data) => this.availableTypes.set(data),
      error: () => console.error('Error al cargar tipos de incidencias')
    });
  }

  loadIncidents(): void {
    if (!this.personalId) return;
    this.isLoading.set(true);
    this.incidentService.getAll().subscribe({
      next: (data) => {
        this.incidents.set(data.filter((i: any) => i.personal_id === this.personalId));
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMsg.set('Error al cargar historial de incidencias.');
        this.isLoading.set(false);
      }
    });
  }

  openCreateModal(): void {
    if (!this.personalId) return;
    this.isEditing.set(false);
    this.editingId.set(null);
    this.form.reset({
      personal_id: this.personalId,
      incident_type_id: 0,
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      description: '',
      status: true
    });
    this.getModal()?.show();
  }

  openEditModal(incident: any): void {
    this.isEditing.set(true);
    this.editingId.set(incident.id);
    this.form.reset({
      personal_id: incident.personal_id,
      incident_type_id: incident.incident_type_id ?? 0,
      start_date: incident.start_date ? new Date(incident.start_date).toISOString().split('T')[0] : '',
      end_date: incident.end_date ? new Date(incident.end_date).toISOString().split('T')[0] : '',
      description: incident.description ?? '',
      status: incident.status ?? true
    });
    this.getModal()?.show();
  }

  saveIncident(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const rawData = this.form.getRawValue();
    const data: any = {
      ...rawData,
      personal_id: Number(rawData.personal_id),
      incident_type_id: Number(rawData.incident_type_id)
    };

    if (!data.end_date) delete data.end_date;

    if (this.isEditing() && this.editingId() !== null) {
      this.incidentService.update(this.editingId()!, data).subscribe({
        next: () => {
          this.successMsg.set('Incidencia actualizada exitosamente');
          this.getModal()?.hide();
          this.loadIncidents();
          setTimeout(() => this.successMsg.set(null), 3000);
        },
        error: (err: any) => this.errorMsg.set(err.error?.message || 'Error al actualizar')
      });
    } else {
      this.incidentService.create(data).subscribe({
        next: () => {
          this.successMsg.set('Incidencia registrada exitosamente');
          this.getModal()?.hide();
          this.loadIncidents();
          setTimeout(() => this.successMsg.set(null), 3000);
        },
        error: (err: any) => this.errorMsg.set(err.error?.message || 'Error al registrar')
      });
    }
  }

  deleteIncident(id: number): void {
    if(confirm('¿Está seguro de eliminar esta incidencia?')) {
      this.incidentService.delete(id).subscribe({
        next: () => {
          this.successMsg.set('Incidencia eliminada');
          this.loadIncidents();
          setTimeout(() => this.successMsg.set(null), 3000);
        },
        error: () => this.errorMsg.set('Error al eliminar la incidencia')
      });
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
