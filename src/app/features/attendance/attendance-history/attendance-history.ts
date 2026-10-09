import { Component, inject, OnInit, signal, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { AttendanceService } from '../../../core/services/attendance.service';
import { TypeAttendanceService } from '../../../core/services/catalogs/type-attendance.service';
import { Attendance } from '../../../core/models/attendance.model';

declare const bootstrap: any;

@Component({
  selector: 'app-attendance-history',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './attendance-history.html',
})
export class AttendanceHistoryComponent implements OnInit, OnChanges {
  @Input() personalId: number | null = null;

  private readonly attendanceService = inject(AttendanceService);
  private readonly typeAttendanceService = inject(TypeAttendanceService);
  private readonly fb = inject(FormBuilder);

  attendances = signal<Attendance[]>([]);
  availableTypes = signal<any[]>([]);
  
  isLoading = signal(false);
  errorMsg = signal<string | null>(null);
  successMsg = signal<string | null>(null);

  isEditing = signal(false);
  editingId = signal<number | null>(null);

  readonly form = this.fb.nonNullable.group({
    personal_id: [0, [Validators.required, Validators.min(1)]],
    attendance_type_id: [0, [Validators.required, Validators.min(1)]],
    date: ['', [Validators.required]],
    entry_time: [''],
    exit_time: [''],
    observation: ['']
  });

  private modalInstance: any;

  ngOnInit(): void {
    this.loadCatalogs();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['personalId'] && this.personalId !== null) {
      this.loadAttendances();
    }
  }

  getModal(): any {
    if (!this.modalInstance) {
      const el = document.getElementById('attendanceFormModal');
      if (el) {
        this.modalInstance = new bootstrap.Modal(el);
      }
    }
    return this.modalInstance;
  }

  loadCatalogs(): void {
    this.typeAttendanceService.getAll().subscribe({
      next: (data) => this.availableTypes.set(data),
      error: () => console.error('Error al cargar tipos de asistencia')
    });
  }

  loadAttendances(): void {
    if (!this.personalId) return;
    this.isLoading.set(true);
    // Asumimos que el backend puede filtrar, pero por ahora traeremos todo y filtraremos
    this.attendanceService.getAll().subscribe({
      next: (data) => {
        this.attendances.set(data.filter(a => a.personal_id === this.personalId));
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMsg.set('Error al cargar historial de asistencias.');
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
      attendance_type_id: 0,
      date: new Date().toISOString().split('T')[0], // hoy
      entry_time: '',
      exit_time: '',
      observation: ''
    });
    this.getModal()?.show();
  }

  openEditModal(att: Attendance): void {
    this.isEditing.set(true);
    this.editingId.set(att.id);
    this.form.reset({
      personal_id: att.personal_id,
      attendance_type_id: att.attendance_type_id ?? 0,
      date: att.date ? new Date(att.date).toISOString().split('T')[0] : '',
      entry_time: att.entry_time ?? '',
      exit_time: att.exit_time ?? '',
      observation: att.observation ?? ''
    });
    this.getModal()?.show();
  }

  saveAttendance(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const rawData = this.form.getRawValue();
    const data: any = {
      ...rawData,
      personal_id: Number(rawData.personal_id),
      attendance_type_id: Number(rawData.attendance_type_id)
    };

    if (!data.entry_time) delete data.entry_time;
    if (!data.exit_time) delete data.exit_time;

    if (this.isEditing() && this.editingId() !== null) {
      this.attendanceService.update(this.editingId()!, data).subscribe({
        next: () => {
          this.successMsg.set('Asistencia actualizada exitosamente');
          this.getModal()?.hide();
          this.loadAttendances();
          setTimeout(() => this.successMsg.set(null), 3000);
        },
        error: (err: any) => this.errorMsg.set(err.error?.message || 'Error al actualizar')
      });
    } else {
      this.attendanceService.create(data).subscribe({
        next: () => {
          this.successMsg.set('Asistencia registrada exitosamente');
          this.getModal()?.hide();
          this.loadAttendances();
          setTimeout(() => this.successMsg.set(null), 3000);
        },
        error: (err: any) => this.errorMsg.set(err.error?.message || 'Error al registrar')
      });
    }
  }

  deleteAttendance(id: number): void {
    if(confirm('¿Está seguro de eliminar esta asistencia?')) {
      this.attendanceService.delete(id).subscribe({
        next: () => {
          this.successMsg.set('Asistencia eliminada');
          this.loadAttendances();
          setTimeout(() => this.successMsg.set(null), 3000);
        },
        error: () => this.errorMsg.set('Error al eliminar la asistencia')
      });
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
