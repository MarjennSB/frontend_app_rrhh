import { Component, inject, OnInit, signal, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { VacationService } from '../../../core/services/vacation.service';
import { VacationTypeService } from '../../../core/services/catalogs/vacation-type.service';

declare const bootstrap: any;

@Component({
  selector: 'app-vacations-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './vacations-modal.html',
})
export class VacationsModalComponent implements OnInit, OnChanges {
  @Input() personalId: number | null = null;

  private readonly vacationService = inject(VacationService);
  private readonly vacationTypeService = inject(VacationTypeService);
  private readonly fb = inject(FormBuilder);

  vacations = signal<any[]>([]);
  availableTypes = signal<any[]>([]);
  
  isLoading = signal(false);
  errorMsg = signal<string | null>(null);
  successMsg = signal<string | null>(null);

  isEditing = signal(false);
  editingId = signal<number | null>(null);

  readonly form = this.fb.nonNullable.group({
    personal_id: [0, [Validators.required, Validators.min(1)]],
    vacation_type_id: [0, [Validators.required, Validators.min(1)]],
    start_date: ['', [Validators.required]],
    end_date: ['', [Validators.required]],
    status: [true]
  });

  private modalInstance: any;

  ngOnInit(): void {
    this.loadCatalogs();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['personalId'] && this.personalId !== null) {
      this.loadVacations();
    }
  }

  getModal(): any {
    if (!this.modalInstance) {
      const el = document.getElementById('vacationFormModal');
      if (el) {
        this.modalInstance = new bootstrap.Modal(el);
      }
    }
    return this.modalInstance;
  }

  loadCatalogs(): void {
    this.vacationTypeService.getAll().subscribe({
      next: (data) => this.availableTypes.set(data),
      error: () => console.error('Error al cargar tipos de vacaciones')
    });
  }

  loadVacations(): void {
    if (!this.personalId) return;
    this.isLoading.set(true);
    this.vacationService.getAll().subscribe({
      next: (data) => {
        this.vacations.set(data.filter((v: any) => v.personal_id === this.personalId));
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMsg.set('Error al cargar historial de vacaciones.');
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
      vacation_type_id: 0,
      start_date: '',
      end_date: '',
      status: true
    });
    this.getModal()?.show();
  }

  openEditModal(vacation: any): void {
    this.isEditing.set(true);
    this.editingId.set(vacation.id);
    this.form.reset({
      personal_id: vacation.personal_id,
      vacation_type_id: vacation.vacation_type_id ?? 0,
      start_date: vacation.start_date ? new Date(vacation.start_date).toISOString().split('T')[0] : '',
      end_date: vacation.end_date ? new Date(vacation.end_date).toISOString().split('T')[0] : '',
      status: vacation.status ?? true
    });
    this.getModal()?.show();
  }

  saveVacation(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const rawData = this.form.getRawValue();
    
    const start = new Date(rawData.start_date);
    const end = new Date(rawData.end_date);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const data: any = {
      ...rawData,
      personal_id: Number(rawData.personal_id),
      vacation_type_id: Number(rawData.vacation_type_id),
      days_quantity: diffDays
    };

    if (this.isEditing() && this.editingId() !== null) {
      this.vacationService.update(this.editingId()!, data).subscribe({
        next: () => {
          this.successMsg.set('Vacaciones actualizadas exitosamente');
          this.getModal()?.hide();
          this.loadVacations();
          setTimeout(() => this.successMsg.set(null), 3000);
        },
        error: (err: any) => this.errorMsg.set(err.error?.message || 'Error al actualizar')
      });
    } else {
      this.vacationService.create(data).subscribe({
        next: () => {
          this.successMsg.set('Vacaciones registradas exitosamente');
          this.getModal()?.hide();
          this.loadVacations();
          setTimeout(() => this.successMsg.set(null), 3000);
        },
        error: (err: any) => this.errorMsg.set(err.error?.message || 'Error al registrar')
      });
    }
  }

  deleteVacation(id: number): void {
    if(confirm('¿Está seguro de anular estas vacaciones?')) {
      this.vacationService.delete(id).subscribe({
        next: () => {
          this.successMsg.set('Vacaciones anuladas');
          this.loadVacations();
          setTimeout(() => this.successMsg.set(null), 3000);
        },
        error: () => this.errorMsg.set('Error al anular las vacaciones')
      });
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
