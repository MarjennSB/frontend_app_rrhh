import { Component, inject, OnInit, signal, Input, SimpleChanges, OnChanges, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ContractService } from '../../../core/services/contract.service';
import { PersonalService } from '../../../core/services/personal.service';
import { TypeContractService } from '../../../core/services/catalogs/type-contract.service';
import { Contract } from '../../../core/models/contract.model';
import { CommonModule } from '@angular/common';

declare const bootstrap: any;

@Component({
  selector: 'app-contracts-list',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './contracts-list.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ContractsListComponent implements OnInit, OnChanges {
  @Input() isModalMode = false;
  @Input() personalId: number | null = null;

  private readonly contractService = inject(ContractService);
  private readonly personalService = inject(PersonalService);
  private readonly typeContractService = inject(TypeContractService);
  private readonly fb = inject(FormBuilder);

  contracts = signal<Contract[]>([]);
  filteredContracts = signal<Contract[]>([]);
  isLoading = signal(false);
  errorMsg = signal<string | null>(null);
  successMsg = signal<string | null>(null);
  warningMsg = signal<string | null>(null);
  isEditing = signal(false);
  editingId = signal<number | null>(null);
  searchTerm = signal('');

  availablePersonals = signal<any[]>([]);
  availableTypeContracts = signal<any[]>([]);

  readonly contractForm = this.fb.nonNullable.group({
    personal_id: [0, [Validators.required, Validators.min(1)]],
    contract_type_id: [0, [Validators.required, Validators.min(1)]],
    start_date: ['', [Validators.required]],
    end_date: [''],
    salary: [0, [Validators.required, Validators.min(0)]],
    observation: [''],
    status: [true]
  });

  private modalInstance: any;

  ngOnInit(): void {
    this.loadContracts();
    this.loadCatalogs();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['personalId'] && !changes['personalId'].firstChange) {
      this.applyFilter();
    }
  }

  getModal(): any {
    if (!this.modalInstance) {
      const el = document.getElementById('contractModal');
      if (el) {
        this.modalInstance = new bootstrap.Modal(el);
      }
    }
    return this.modalInstance;
  }

  loadContracts(): void {
    this.isLoading.set(true);
    this.contractService.getAll().subscribe({
      next: (data) => {
        this.contracts.set(data);
        this.applyFilter();
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMsg.set('Error al cargar la lista de contratos');
        this.isLoading.set(false);
      },
    });
  }

  loadCatalogs(): void {
    this.personalService.getAll().subscribe({
      next: (data) => this.availablePersonals.set(data),
      error: () => console.error('Error al cargar asignaciones de personal')
    });
    this.typeContractService.getAll().subscribe({
      next: (data) => this.availableTypeContracts.set(data),
      error: () => console.error('Error al cargar tipos de contrato')
    });
  }

  applyFilter(): void {
    const term = this.searchTerm().toLowerCase();
    
    let baseData = this.contracts();
    if (this.isModalMode && this.personalId !== null) {
      baseData = baseData.filter(c => c.personal_id === this.personalId);
    }

    if (!term) {
      this.filteredContracts.set(baseData);
      return;
    }
    this.filteredContracts.set(
      baseData.filter((c) => {
        const docNum = c.personal?.person?.document_number?.toLowerCase() || '';
        const name = `${c.personal?.person?.first_name} ${c.personal?.person?.last_name}`.toLowerCase();
        const type = c.contract_type?.name?.toLowerCase() || '';
        return docNum.includes(term) || name.includes(term) || type.includes(term);
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
    this.contractForm.reset({
      personal_id: this.isModalMode && this.personalId !== null ? this.personalId : 0,
      contract_type_id: 0,
      start_date: '',
      end_date: '',
      salary: 0,
      observation: '',
      status: true
    });
    this.errorMsg.set(null);
    this.getModal()?.show();
  }

  openEditModal(contract: Contract): void {
    this.isEditing.set(true);
    this.editingId.set(contract.id);
    this.contractForm.reset({
      personal_id: contract.personal_id,
      contract_type_id: contract.contract_type_id,
      start_date: contract.start_date ? new Date(contract.start_date).toISOString().split('T')[0] : '',
      end_date: contract.end_date ? new Date(contract.end_date).toISOString().split('T')[0] : '',
      salary: contract.salary ?? 0,
      observation: contract.observation ?? '',
      status: contract.status
    });
    this.errorMsg.set(null);
    this.getModal()?.show();
  }

  toggleActive(contract: Contract): void {
    const newStatus = !contract.status;
    this.contractService.update(contract.id, { status: newStatus }).subscribe({
      next: () => {
        if (newStatus) {
          this.successMsg.set('Contrato activado con éxito');
          setTimeout(() => this.successMsg.set(null), 2000);
        } else {
          this.warningMsg.set('Contrato desactivado con éxito');
          setTimeout(() => this.warningMsg.set(null), 2000);
        }
        this.loadContracts();
      },
      error: () => {
        this.errorMsg.set('Error al cambiar el estado del contrato');
      },
    });
  }

  saveContract(): void {
    if (this.contractForm.invalid) {
      this.contractForm.markAllAsTouched();
      return;
    }
    const rawData = this.contractForm.getRawValue();
    const data: any = {
      ...rawData,
      personal_id: Number(rawData.personal_id),
      contract_type_id: Number(rawData.contract_type_id),
      salary: Number(rawData.salary)
    };

    if (!data.end_date) {
      delete data.end_date;
    }

    if (this.isEditing() && this.editingId() !== null) {
      this.contractService.update(this.editingId()!, data).subscribe({
        next: () => {
          this.successMsg.set('Contrato actualizado exitosamente');
          setTimeout(() => this.successMsg.set(null), 2000);
          this.getModal()?.hide();
          this.loadContracts();
        },
        error: (err) => {
          this.errorMsg.set(err.error?.message || 'Error al actualizar el contrato');
          setTimeout(() => this.errorMsg.set(null), 2000);
        },
      });
    } else {
      this.contractService.create(data).subscribe({
        next: () => {
          this.successMsg.set('Contrato creado exitosamente');
          setTimeout(() => this.successMsg.set(null), 2000);
          this.getModal()?.hide();
          this.loadContracts();
        },
        error: (err) => {
          this.errorMsg.set(err.error?.message || 'Error al crear el contrato');
          setTimeout(() => this.errorMsg.set(null), 2000);
        },
      });
    }
  }

  get unassignedContractTypes() {
    const allTypes = this.availableTypeContracts();
    const pid = this.isModalMode && this.personalId !== null 
      ? this.personalId 
      : Number(this.contractForm.get('personal_id')?.value || 0);

    if (!pid) return allTypes;

    const existingTypeIds = this.contracts()
      .filter(c => c.personal_id === pid)
      .map(c => c.contract_type_id);

    return allTypes.filter(type => {
      if (this.isEditing() && this.editingId() !== null) {
        const currentContract = this.contracts().find(c => c.id === this.editingId());
        if (currentContract && currentContract.contract_type_id === type.id) {
          return true;
        }
      }
      return !existingTypeIds.includes(type.id);
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.contractForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
