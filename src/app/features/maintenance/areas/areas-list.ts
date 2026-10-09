import { Component, inject, OnInit, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrganizationalUnitService } from '../../../core/services/catalogs/organizational-unit.service';
import { OrganizationalUnit } from '../../../core/models/organizational-unit.model';

declare const bootstrap: any;

@Component({
  selector: 'app-areas-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './areas-list.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AreasListComponent implements OnInit {
  private readonly orgUnitService = inject(OrganizationalUnitService);

  areas = signal<OrganizationalUnit[]>([]);
  filteredAreas = signal<OrganizationalUnit[]>([]);
  
  isLoading = signal(false);
  searchTerm = signal('');

  isEditMode = signal(false);
  successMsg = signal<string | null>(null);
  errorMsg = signal<string | null>(null);
  formData: Partial<OrganizationalUnit> = {};

  private modalInstance: any;

  ngOnInit(): void {
    this.loadData();
  }

  getModal(): any {
    if (!this.modalInstance) {
      const el = document.getElementById('showModalAreas');
      if (el) {
        this.modalInstance = new bootstrap.Modal(el);
      }
    }
    return this.modalInstance;
  }

  loadData(): void {
    this.isLoading.set(true);
    this.orgUnitService.getAll().subscribe({
      next: (data) => {
        this.areas.set(data);
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
      this.filteredAreas.set(this.areas());
      return;
    }
    this.filteredAreas.set(
      this.areas().filter((item) => item.name.toLowerCase().includes(term))
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
      description: '',
      status: true
    };
    this.getModal()?.show();
  }

  editItem(item: OrganizationalUnit): void {
    this.isEditMode.set(true);
    this.errorMsg.set(null);
    this.formData = { ...item };
    this.getModal()?.show();
  }

  saveData(): void {
    if (this.isEditMode()) {
      this.orgUnitService.update(this.formData.id!, this.formData).subscribe({
        next: () => {
          this.loadData();
          this.getModal()?.hide();
          this.successMsg.set('Área guardado exitosamente');
          setTimeout(() => this.successMsg.set(null), 2000);
        },
        error: (err) => {
          this.errorMsg.set(err.error?.message || 'Error al actualizar el área');
        }
      });
    } else {
      this.orgUnitService.create(this.formData).subscribe({
        next: () => {
          this.loadData();
          this.getModal()?.hide();
          this.successMsg.set('Área guardado exitosamente');
          setTimeout(() => this.successMsg.set(null), 2000);
        },
        error: (err) => {
          this.errorMsg.set(err.error?.message || 'Error al crear el área');
        }
      });
    }
  }
}
