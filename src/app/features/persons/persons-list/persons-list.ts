import { Component, inject, OnInit, signal, Input, Output, EventEmitter, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { PersonService } from '../../../core/services/person.service';
import { TypeDocumentService } from '../../../core/services/catalogs/type-document.service';
import { GenderService } from '../../../core/services/catalogs/gender.service';
import { DepartmentService } from '../../../core/services/catalogs/department.service';
import { ProvinceService } from '../../../core/services/catalogs/province.service';
import { DistrictService } from '../../../core/services/catalogs/district.service';
import { Person } from '../../../core/models/person.model';

declare const bootstrap: any;

@Component({
  selector: 'app-persons-list',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './persons-list.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PersonsListComponent implements OnInit {
  @Input() isModalMode: boolean = false;
  @Output() onSelectPerson = new EventEmitter<Person>();

  private readonly personService = inject(PersonService);
  private readonly typeDocService = inject(TypeDocumentService);
  private readonly genderService = inject(GenderService);
  private readonly deptService = inject(DepartmentService);
  private readonly provService = inject(ProvinceService);
  private readonly distService = inject(DistrictService);
  private readonly fb = inject(FormBuilder);

  persons = signal<Person[]>([]);
  filteredPersons = signal<Person[]>([]);
  isLoading = signal(false);
  errorMsg = signal<string | null>(null);
  successMsg = signal<string | null>(null);
  warningMsg = signal<string | null>(null);
  isEditing = signal(false);
  editingId = signal<number | null>(null);
  searchTerm = signal('');

  availableDocTypes = signal<any[]>([]);
  availableGenders = signal<any[]>([]);
  
  allDepartments = signal<any[]>([]);
  allProvinces = signal<any[]>([]);
  allDistricts = signal<any[]>([]);
  
  availableProvinces = signal<any[]>([]);
  availableDistricts = signal<any[]>([]);

  readonly personForm = this.fb.nonNullable.group({
    identity_document_type_id: [0, [Validators.required, Validators.min(1)]],
    document_number: ['', [Validators.required, Validators.maxLength(100)]],
    first_name: ['', [Validators.required, Validators.maxLength(150)]],
    last_name: ['', [Validators.maxLength(100)]],
    second_last_name: ['', [Validators.maxLength(100)]],
    email: ['', [Validators.email, Validators.maxLength(150)]],
    phone_number: ['', [Validators.maxLength(20)]],
    address: ['', [Validators.maxLength(255)]],
    department_id: ['', [Validators.required]],
    province_id: ['', [Validators.required]],
    district_id: ['', [Validators.required, Validators.maxLength(6)]],
    gender_id: [0, [Validators.required, Validators.min(1)]],
    status: [true],
  });

  ngOnInit(): void {
    this.loadPersons();
    this.loadCatalogs();
  }

  selectPerson(person: Person): void {
    this.onSelectPerson.emit(person);
  }

  loadCatalogs(): void {
    this.typeDocService.getAll().subscribe({ next: (data) => this.availableDocTypes.set(data) });
    this.genderService.getAll().subscribe({ next: (data) => this.availableGenders.set(data) });
    this.deptService.getAll().subscribe({ next: (data) => this.allDepartments.set(data) });
    this.provService.getAll().subscribe({ next: (data) => this.allProvinces.set(data) });
    this.distService.getAll().subscribe({ next: (data) => this.allDistricts.set(data) });
    
    // Subscribe to department changes to filter provinces
    this.personForm.get('department_id')?.valueChanges.subscribe(deptId => {
      if (deptId) {
        this.availableProvinces.set(this.allProvinces().filter(p => p.department_id === deptId));
        // Reset children only if editingId is null or if the user triggered the change
        // We will handle it by just clearing the value
        this.personForm.patchValue({ province_id: '', district_id: '' }, { emitEvent: false });
        this.availableDistricts.set([]);
      }
    });

    // Subscribe to province changes to filter districts
    this.personForm.get('province_id')?.valueChanges.subscribe(provId => {
      if (provId) {
        this.availableDistricts.set(this.allDistricts().filter(d => d.province_id === provId));
        this.personForm.patchValue({ district_id: '' }, { emitEvent: false });
      }
    });
  }

  loadPersons(): void {
    this.isLoading.set(true);
    this.personService.getAll().subscribe({
      next: (data) => {
        this.persons.set(data);
        this.applyFilter();
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMsg.set('Error al cargar las personas.');
        this.isLoading.set(false);
      },
    });
  }

  applyFilter(): void {
    const term = this.searchTerm().toLowerCase();
    if (!term) {
      this.filteredPersons.set(this.persons());
      return;
    }
    this.filteredPersons.set(
      this.persons().filter(
        (p) =>
          p.document_number.toLowerCase().includes(term) ||
          p.first_name.toLowerCase().includes(term) ||
          (p.last_name ?? '').toLowerCase().includes(term) ||
          (p.email ?? '').toLowerCase().includes(term)
      )
    );
  }

  onSearch(value: string): void {
    this.searchTerm.set(value);
    this.applyFilter();
  }

  openCreateModal(): void {
    this.isEditing.set(false);
    this.editingId.set(null);
    this.personForm.reset({ 
      identity_document_type_id: 0, 
      document_number: '', 
      first_name: '', 
      last_name: '', 
      second_last_name: '', 
      email: '', 
      phone_number: '', 
      address: '', 
      department_id: '',
      province_id: '',
      district_id: '', 
      gender_id: 0, 
      status: true 
    });
    this.errorMsg.set(null);
    this.getModal().show();
  }

  openEditModal(person: Person): void {
    this.isEditing.set(true);
    this.editingId.set(person.id);
    // Find the department and province of the district
    let deptId = '';
    let provId = '';
    const district = this.allDistricts().find(d => d.id === person.district_id);
    if (district) {
      provId = district.province_id;
      const prov = this.allProvinces().find(p => p.id === provId);
      if (prov) {
        deptId = prov.department_id;
      }
    }

    // Set available options so form can bind
    this.availableProvinces.set(this.allProvinces().filter(p => p.department_id === deptId));
    this.availableDistricts.set(this.allDistricts().filter(d => d.province_id === provId));

    this.personForm.reset({
      identity_document_type_id: person.identity_document_type_id,
      document_number: person.document_number,
      first_name: person.first_name,
      last_name: person.last_name ?? '',
      second_last_name: person.second_last_name ?? '',
      email: person.email ?? '',
      phone_number: person.phone_number ?? '',
      address: person.address ?? '',
      department_id: deptId,
      province_id: provId,
      district_id: person.district_id,
      gender_id: person.gender_id,
      status: person.status,
    });
    this.errorMsg.set(null);
    this.getModal().show();
  }

  savePerson(): void {
    if (this.personForm.invalid) {
      this.personForm.markAllAsTouched();
      return;
    }
    const rawData = this.personForm.getRawValue();
    const { department_id, province_id, ...data } = {
      ...rawData,
      identity_document_type_id: Number(rawData.identity_document_type_id),
      gender_id: Number(rawData.gender_id)
    };

    if (this.isEditing() && this.editingId() !== null) {
      this.personService.update(this.editingId()!, data).subscribe({
        next: () => { this.getModal().hide(); this.showSuccess('Persona actualizada.'); this.loadPersons(); },
        error: (err) => this.errorMsg.set(err?.error?.message || 'Error al actualizar.'),
      });
    } else {
      this.personService.create(data).subscribe({
        next: () => { this.getModal().hide(); this.showSuccess('Persona creada.'); this.loadPersons(); },
        error: (err) => this.errorMsg.set(err?.error?.message || 'Error al crear.'),
      });
    }
  }

  toggleActive(person: Person): void {
    const newStatus = !person.status;
    this.personService.update(person.id, { status: newStatus }).subscribe({
      next: () => { 
        if (newStatus) {
          this.showSuccess('Persona activada.');
        } else {
          this.showWarning('Persona desactivada.');
        }
        this.loadPersons(); 
      },
      error: () => this.errorMsg.set('Error al cambiar estado.'),
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.personForm.get(field);
    return !!control && control.invalid && control.touched;
  }

  private showSuccess(msg: string): void {
    this.successMsg.set(msg);
    setTimeout(() => this.successMsg.set(null), 2000);
  }

  private showWarning(msg: string): void {
    this.warningMsg.set(msg);
    setTimeout(() => this.warningMsg.set(null), 2000);
  }

  private getModal(): any {
    return bootstrap.Modal.getOrCreateInstance(document.getElementById('personModal'));
  }
}
