import { Component, inject, OnInit, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { AttendanceService } from '../../../core/services/attendance.service';
import { PersonalService } from '../../../core/services/personal.service';
import { TypeAttendanceService } from '../../../core/services/catalogs/type-attendance.service';
import { Personal } from '../../../core/models/personal.model';

declare const bootstrap: any;

@Component({
  selector: 'app-attendance-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './attendance-list.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AttendanceList implements OnInit {
  private readonly attendanceService = inject(AttendanceService);
  private readonly personalService = inject(PersonalService);
  private readonly typeAttendanceService = inject(TypeAttendanceService);
  private readonly fb = inject(FormBuilder);

  attendances = signal<any[]>([]);
  filteredAttendances = signal<any[]>([]);
  
  personals = signal<Personal[]>([]);
  attendanceTypes = signal<any[]>([]);

  isLoading = signal(false);
  searchTerm = signal('');

  successMsg = signal<string | null>(null);
  warningMsg = signal<string | null>(null);

  isEditMode = signal(false);
  editingId = signal<number | null>(null);

  readonly form = this.fb.nonNullable.group({
    personal_id: [0, [Validators.required, Validators.min(1)]],
    attendance_type_id: [0], // Optional in DB, but good to have
    date: ['', [Validators.required]],
    entry_time: [''],
    exit_time: [''],
    observation: [''],
    status: [true]
  });

  private modalInstance: any;

  ngOnInit(): void {
    this.loadData();
    this.loadCatalogs();
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
    this.personalService.getAll().subscribe({
      next: (data) => this.personals.set(data.filter(p => p.status === true))
    });
    this.typeAttendanceService.getAll().subscribe({
      next: (data) => this.attendanceTypes.set(data.filter(t => t.status === true))
    });
  }

  loadData(): void {
    this.isLoading.set(true);
    this.attendanceService.getAll().subscribe({
      next: (data) => {
        // Sort descending by date and time
        const sorted = data.sort((a: any, b: any) => {
           return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
        this.attendances.set(sorted);
        this.applyFilter();
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  applyFilter(): void {
    const term = this.searchTerm().toLowerCase();
    if (!term) {
      this.filteredAttendances.set(this.attendances());
      return;
    }
    this.filteredAttendances.set(
      this.attendances().filter((item) => {
        const p = item.personal?.person;
        const name = `${p?.first_name} ${p?.last_name}`.toLowerCase();
        const doc = p?.document_number?.toLowerCase() || '';
        const dateStr = item.date.toLowerCase();
        return name.includes(term) || doc.includes(term) || dateStr.includes(term);
      })
    );
  }

  onSearch(value: string): void {
    this.searchTerm.set(value);
    this.applyFilter();
  }

  openModal(): void {
    this.isEditMode.set(false);
    this.editingId.set(null);
    this.form.reset({
      personal_id: 0,
      attendance_type_id: 0,
      date: new Date().toISOString().split('T')[0],
      entry_time: '',
      exit_time: '',
      observation: '',
      status: true
    });
    this.getModal()?.show();
  }

  editItem(item: any): void {
    this.isEditMode.set(true);
    this.editingId.set(item.id);
    this.form.reset({
      personal_id: item.personal_id,
      attendance_type_id: item.attendance_type_id || 0,
      date: item.date ? new Date(item.date).toISOString().split('T')[0] : '',
      entry_time: item.entry_time || '',
      exit_time: item.exit_time || '',
      observation: item.observation || '',
      status: item.status !== undefined ? item.status : true
    });
    this.getModal()?.show();
  }

  saveData(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const rawData = this.form.getRawValue();
    const data: any = {
      personal_id: Number(rawData.personal_id),
      date: rawData.date,
      status: rawData.status
    };

    if (rawData.attendance_type_id) data.attendance_type_id = Number(rawData.attendance_type_id);
    if (rawData.entry_time) data.entry_time = rawData.entry_time + (rawData.entry_time.length === 5 ? ':00' : '');
    if (rawData.exit_time) data.exit_time = rawData.exit_time + (rawData.exit_time.length === 5 ? ':00' : '');
    if (rawData.observation) data.observation = rawData.observation;

    if (this.isEditMode() && this.editingId() !== null) {
      this.attendanceService.update(this.editingId()!, data).subscribe({
        next: () => {
          this.successMsg.set('Asistencia actualizada con éxito');
          setTimeout(() => this.successMsg.set(null), 2000);
          this.loadData();
          this.getModal()?.hide();
        },
        error: (err) => {
          alert(err.error?.message || 'Error al actualizar el registro');
        }
      });
    } else {
      this.attendanceService.create(data).subscribe({
        next: () => {
          this.successMsg.set('Asistencia creada con éxito');
          setTimeout(() => this.successMsg.set(null), 2000);
          this.loadData();
          this.getModal()?.hide();
        },
        error: (err) => {
          alert(err.error?.message || 'Error al crear el registro (¿Quizá ya existe para esa fecha?)');
        }
      });
    }
  }

  toggleStatus(item: any): void {
    const newStatus = !item.status;
    this.attendanceService.update(item.id, { status: newStatus }).subscribe({
      next: () => {
        if (newStatus) {
          this.successMsg.set('Asistencia validada con éxito');
          setTimeout(() => this.successMsg.set(null), 2000);
        } else {
          this.warningMsg.set('Asistencia anulada con éxito');
          setTimeout(() => this.warningMsg.set(null), 2000);
        }
        this.loadData();
      },
      error: () => alert('Error al cambiar estado')
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
