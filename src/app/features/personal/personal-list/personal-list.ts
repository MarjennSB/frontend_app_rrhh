import { Component, inject, OnInit, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { PersonalService } from '../../../core/services/personal.service';
import { PersonService } from '../../../core/services/person.service';
import { PositionService } from '../../../core/services/catalogs/position.service';
import { OrganizationalUnitService } from '../../../core/services/catalogs/organizational-unit.service';
import { Personal } from '../../../core/models/personal.model';
import { Person } from '../../../core/models/person.model';
import { ScheduleService } from '../../../core/services/catalogs/schedule.service';
import { CommonModule } from '@angular/common';
import { PersonsListComponent } from '../../persons/persons-list/persons-list';
import { PersonalDocumentsListComponent } from '../../personal-documents/personal-documents-list/personal-documents-list';
import { ContractsListComponent } from '../../contracts/contracts-list/contracts-list';
import { VacationsModalComponent } from '../../vacations/vacations-modal/vacations-modal';
import { IncidentsModalComponent } from '../../incidents/incidents-modal/incidents-modal';

declare const bootstrap: any;

@Component({
  selector: 'app-personal-list',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, PersonsListComponent, PersonalDocumentsListComponent, ContractsListComponent, VacationsModalComponent, IncidentsModalComponent],
  templateUrl: './personal-list.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PersonalListComponent implements OnInit {
  private readonly personalService = inject(PersonalService);
  private readonly personService = inject(PersonService);
  private readonly positionService = inject(PositionService);
  private readonly orgUnitService = inject(OrganizationalUnitService);
  private readonly scheduleService = inject(ScheduleService);
  private readonly fb = inject(FormBuilder);

  personals = signal<Personal[]>([]);
  filteredPersonals = signal<Personal[]>([]);
  isLoading = signal(false);
  errorMsg = signal<string | null>(null);
  successMsg = signal<string | null>(null);
  warningMsg = signal<string | null>(null);
  isEditing = signal(false);
  editingId = signal<number | null>(null);
  searchTerm = signal('');

  availablePersons = signal<any[]>([]);
  availablePositions = signal<any[]>([]);
  availableOrgUnits = signal<any[]>([]);
  allSchedules = signal<any[]>([]);
  availableSchedules = signal<any[]>([]);

  readonly personalForm = this.fb.nonNullable.group({
    person_id: [0, [Validators.required, Validators.min(1)]],
    position_id: [0, [Validators.required, Validators.min(1)]],
    organizational_unit_id: [0, [Validators.required, Validators.min(1)]],
    schedule_id: [0, [Validators.required, Validators.min(1)]],
    status: [true]
  });

  selectedPersonDisplay = signal<string>('');
  selectedPersonalIdForDocs = signal<number | null>(null);
  selectedPersonalIdForContracts = signal<number | null>(null);
  selectedPersonalIdForVacations = signal<number | null>(null);
  selectedPersonalIdForIncidents = signal<number | null>(null);

  private modalInstance: any;
  private managePersonsModalInstance: any;
  private documentsModalInstance: any;
  private contractsModalInstance: any;
  private vacationsModalInstance: any;
  private incidentsModalInstance: any;

  ngOnInit(): void {
    this.personalForm.controls['position_id'].disable();
    this.personalForm.controls['schedule_id'].disable();

    this.personalForm.controls['organizational_unit_id'].valueChanges.subscribe(unitId => {
      if (unitId && unitId > 0) {
        this.personalForm.controls['position_id'].disable();
        this.positionService.getByUnit(unitId).subscribe({
          next: (data) => {
            this.availablePositions.set(data);
            this.personalForm.controls['position_id'].enable();
            
            const currentPosition = this.personalForm.controls['position_id'].value;
            if (currentPosition && !data.some(p => p.id == currentPosition)) {
              this.personalForm.controls['position_id'].setValue(0);
            }
          },
          error: () => console.error('Error al cargar cargos por unidad')
        });

        // Filter schedules
        const filteredSchedules = this.allSchedules().filter(s => s.organizational_unit_id === unitId);
        this.availableSchedules.set(filteredSchedules);
        this.personalForm.controls['schedule_id'].enable();
        const currentSchedule = this.personalForm.controls['schedule_id'].value;
        if (currentSchedule && !filteredSchedules.some(s => s.id == currentSchedule)) {
          this.personalForm.controls['schedule_id'].setValue(0);
        }

      } else {
        this.availablePositions.set([]);
        this.availableSchedules.set([]);
        this.personalForm.controls['position_id'].disable();
        this.personalForm.controls['position_id'].setValue(0);
        this.personalForm.controls['schedule_id'].disable();
        this.personalForm.controls['schedule_id'].setValue(0);
      }
    });

    this.loadPersonals();
    this.loadCatalogs();
  }

  getModal(): any {
    if (!this.modalInstance) {
      const el = document.getElementById('personalModal');
      if (el) {
        this.modalInstance = new bootstrap.Modal(el);
      }
    }
    return this.modalInstance;
  }

  getManagePersonsModal(): any {
    if (!this.managePersonsModalInstance) {
      const el = document.getElementById('managePersonsModal');
      if (el) {
        this.managePersonsModalInstance = new bootstrap.Modal(el);
      }
    }
    return this.managePersonsModalInstance;
  }

  openManagePersonsModal(): void {
    this.getManagePersonsModal()?.show();
  }

  getDocumentsModal(): any {
    if (!this.documentsModalInstance) {
      const el = document.getElementById('personalDocumentsModal');
      if (el) {
        this.documentsModalInstance = new bootstrap.Modal(el);
      }
    }
    return this.documentsModalInstance;
  }

  openDocumentsModal(personal: Personal): void {
    this.selectedPersonalIdForDocs.set(personal.id);
    this.getDocumentsModal()?.show();
  }

  getContractsModal(): any {
    if (!this.contractsModalInstance) {
      const el = document.getElementById('personalContractsModal');
      if (el) {
        this.contractsModalInstance = new bootstrap.Modal(el);
      }
    }
    return this.contractsModalInstance;
  }

  openContractsModal(personal: Personal): void {
    this.selectedPersonalIdForContracts.set(personal.id);
    this.getContractsModal()?.show();
  }

  getVacationsWrapperModal(): any {
    if (!this.vacationsModalInstance) {
      const el = document.getElementById('personalVacationsModal');
      if (el) {
        this.vacationsModalInstance = new bootstrap.Modal(el);
      }
    }
    return this.vacationsModalInstance;
  }

  openVacationsModal(personal: Personal): void {
    this.selectedPersonalIdForVacations.set(personal.id);
    this.getVacationsWrapperModal()?.show();
  }

  getIncidentsWrapperModal(): any {
    if (!this.incidentsModalInstance) {
      const el = document.getElementById('personalIncidentsModal');
      if (el) {
        this.incidentsModalInstance = new bootstrap.Modal(el);
      }
    }
    return this.incidentsModalInstance;
  }

  openIncidentsModal(personal: Personal): void {
    this.selectedPersonalIdForIncidents.set(personal.id);
    this.getIncidentsWrapperModal()?.show();
  }

  onPersonSelected(person: Person): void {
    const exists = this.availablePersons().find(p => p.id === person.id);
    if (!exists) {
      this.availablePersons.update(persons => [...persons, person]);
    }
    this.personalForm.patchValue({ person_id: person.id });
    this.selectedPersonDisplay.set(`${person.document_number} - ${person.first_name} ${person.last_name || ''}`.trim());
    this.getManagePersonsModal()?.hide();
  }

  loadPersonals(): void {
    this.isLoading.set(true);
    this.personalService.getAll().subscribe({
      next: (data) => {
        this.personals.set(data);
        this.applyFilter();
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMsg.set('Error al cargar la lista del personal');
        this.isLoading.set(false);
      },
    });
  }

  loadCatalogs(): void {
    this.personService.getAll().subscribe({
      next: (data) => this.availablePersons.set(data),
      error: () => console.error('Error al cargar personas')
    });
    this.orgUnitService.getAll().subscribe({
      next: (data) => this.availableOrgUnits.set(data),
      error: () => console.error('Error al cargar unidades organizacionales')
    });
    this.scheduleService.getAll().subscribe({
      next: (data) => this.allSchedules.set(data),
      error: () => console.error('Error al cargar horarios')
    });
  }

  applyFilter(): void {
    const term = this.searchTerm().toLowerCase();
    if (!term) {
      this.filteredPersonals.set(this.personals());
      return;
    }
    this.filteredPersonals.set(
      this.personals().filter((p) => {
        const docNum = p.person?.document_number?.toLowerCase() || '';
        const name = `${p.person?.first_name} ${p.person?.last_name}`.toLowerCase();
        const pos = p.position?.name?.toLowerCase() || '';
        const org = p.organizational_unit?.name?.toLowerCase() || '';
        return docNum.includes(term) || name.includes(term) || pos.includes(term) || org.includes(term);
      })
    );
  }

  onSearch(value: string): void {
    this.searchTerm.set(value);
    this.applyFilter();
  }

  openCreateModal(): void {
    this.isEditing.set(false);
    this.editingId.set(null);
    this.personalForm.reset({
      person_id: 0,
      position_id: 0,
      organizational_unit_id: 0,
      schedule_id: 0,
      status: true
    });
    this.selectedPersonDisplay.set('');
    this.errorMsg.set(null);
    this.getModal()?.show();
  }

  openEditModal(personal: Personal): void {
    this.isEditing.set(true);
    this.editingId.set(personal.id);
    this.personalForm.reset({
      person_id: personal.person_id,
      position_id: personal.position_id,
      organizational_unit_id: personal.organizational_unit_id,
      schedule_id: personal.schedule_id,
      status: personal.status
    });
    
    if (personal.person) {
      this.selectedPersonDisplay.set(`${personal.person.document_number} - ${personal.person.first_name} ${personal.person.last_name || ''}`.trim());
    } else {
      this.selectedPersonDisplay.set('');
    }

    this.errorMsg.set(null);
    this.getModal()?.show();
  }

  toggleActive(personal: Personal): void {
    const newStatus = !personal.status;
    this.personalService.update(personal.id, { status: newStatus }).subscribe({
      next: () => {
        if (newStatus) {
          this.successMsg.set('Personal activado con éxito');
          setTimeout(() => this.successMsg.set(null), 2000);
        } else {
          this.warningMsg.set('Personal desactivado con éxito');
          setTimeout(() => this.warningMsg.set(null), 2000);
        }
        this.loadPersonals();
      },
      error: () => {
        this.errorMsg.set('Error al cambiar el estado del personal');
        setTimeout(() => this.errorMsg.set(null), 2000);
      },
    });
  }

  savePersonal(): void {
    if (this.personalForm.invalid) {
      this.personalForm.markAllAsTouched();
      return;
    }
    const rawData = this.personalForm.getRawValue();
    const data = {
      ...rawData,
      person_id: Number(rawData.person_id),
      position_id: Number(rawData.position_id),
      organizational_unit_id: Number(rawData.organizational_unit_id),
      schedule_id: Number(rawData.schedule_id)
    };

    if (this.isEditing() && this.editingId() !== null) {
      this.personalService.update(this.editingId()!, data).subscribe({
        next: () => {
          this.successMsg.set('Personal actualizado exitosamente');
          setTimeout(() => this.successMsg.set(null), 2000);
          this.getModal()?.hide();
          this.loadPersonals();
        },
        error: (err) => {
          this.errorMsg.set(err.error?.message || 'Error al actualizar el personal');
          setTimeout(() => this.errorMsg.set(null), 2000);
        },
      });
    } else {
      this.personalService.create(data).subscribe({
        next: () => {
          this.successMsg.set('Personal creado exitosamente');
          setTimeout(() => this.successMsg.set(null), 2000);
          this.getModal()?.hide();
          this.loadPersonals();
        },
        error: (err) => {
          this.errorMsg.set(err.error?.message || 'Error al crear el personal');
          setTimeout(() => this.errorMsg.set(null), 2000);
        },
      });
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.personalForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
