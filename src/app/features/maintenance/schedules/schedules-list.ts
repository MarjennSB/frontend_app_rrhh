import { Component, inject, OnInit, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScheduleService } from '../../../core/services/catalogs/schedule.service';
import { Schedule } from '../../../core/models/schedule.model';
import { OrganizationalUnitService } from '../../../core/services/catalogs/organizational-unit.service';

declare const bootstrap: any;

@Component({
  selector: 'app-schedules-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './schedules-list.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SchedulesListComponent implements OnInit {
  private readonly scheduleService = inject(ScheduleService);
  private readonly orgUnitService = inject(OrganizationalUnitService);

  schedules = signal<Schedule[]>([]);
  filteredSchedules = signal<Schedule[]>([]);
  organizationalUnits = signal<any[]>([]);
  
  isLoading = signal(false);
  searchTerm = signal('');

  isEditMode = signal(false);
  successMsg = signal<string | null>(null);
  errorMsg = signal<string | null>(null);
  formData: Partial<Schedule> = {};

  private modalInstance: any;

  ngOnInit(): void {
    this.loadData();
    this.loadOrgUnits();
  }

  getModal(): any {
    if (!this.modalInstance) {
      const el = document.getElementById('showModal');
      if (el) {
        this.modalInstance = new bootstrap.Modal(el);
      }
    }
    return this.modalInstance;
  }

  loadData(): void {
    this.isLoading.set(true);
    this.scheduleService.getAll().subscribe({
      next: (data) => {
        this.schedules.set(data);
        this.applyFilter();
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  loadOrgUnits(): void {
    this.orgUnitService.getAll().subscribe({
      next: (data) => this.organizationalUnits.set(data.filter((u: any) => u.status))
    });
  }

  applyFilter(): void {
    const term = this.searchTerm().toLowerCase();
    if (!term) {
      this.filteredSchedules.set(this.schedules());
      return;
    }
    this.filteredSchedules.set(
      this.schedules().filter((item) => {
        const nameMatch = item.name.toLowerCase().includes(term);
        const orgMatch = item.organizational_unit?.name?.toLowerCase().includes(term);
        return nameMatch || orgMatch;
      })
    );
  }

  onSearch(value: string): void {
    this.searchTerm.set(value);
    this.applyFilter();
  }

  openModal(): void {
    this.isEditMode.set(false);
    this.errorMsg.set(null);
    this.formData = {
      name: '',
      start_time: '08:00',
      end_time: '17:00',
      tolerance_minutes: 0,
      workday_monday: true,
      workday_tuesday: true,
      workday_wednesday: true,
      workday_thursday: true,
      workday_friday: true,
      workday_saturday: false,
      workday_sunday: false,
      organizational_unit_id: '' as any,
      status: true
    };
    this.getModal()?.show();
  }

  editItem(item: Schedule): void {
    this.isEditMode.set(true);
    this.errorMsg.set(null);
    this.formData = { ...item };
    this.getModal()?.show();
  }

  saveData(): void {
    if (this.isEditMode()) {
      this.scheduleService.update(this.formData.id!, this.formData).subscribe({
        next: () => {
          this.loadData();
          this.getModal()?.hide();
          this.successMsg.set('Horario guardado exitosamente');
          setTimeout(() => this.successMsg.set(null), 2000);
        },
        error: (err) => {
          this.errorMsg.set(err.error?.message || 'Error al actualizar el horario');
        }
      });
    } else {
      this.scheduleService.create(this.formData).subscribe({
        next: () => {
          this.loadData();
          this.getModal()?.hide();
          this.successMsg.set('Horario guardado exitosamente');
          setTimeout(() => this.successMsg.set(null), 2000);
        },
        error: (err) => {
          this.errorMsg.set(err.error?.message || 'Error al crear el horario');
        }
      });
    }
  }
}
