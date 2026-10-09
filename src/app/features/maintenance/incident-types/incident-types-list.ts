import { Component, inject, OnInit, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IncidentTypeService } from '../../../core/services/catalogs/incident-type.service';

declare const bootstrap: any;

@Component({
  selector: 'app-incident-types-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './incident-types-list.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IncidentTypesListComponent implements OnInit {
  private readonly incidentTypeService = inject(IncidentTypeService);

  items = signal<any[]>([]);
  filteredItems = signal<any[]>([]);
  
  isLoading = signal(false);
  searchTerm = signal('');

  isEditMode = signal(false);
  successMsg = signal<string | null>(null);
  errorMsg = signal<string | null>(null);
  formData: any = {};

  private modalInstance: any;

  ngOnInit(): void {
    this.loadData();
  }

  getModal(): any {
    if (!this.modalInstance) {
      const el = document.getElementById('showModalIncidentType');
      if (el) {
        this.modalInstance = new bootstrap.Modal(el);
      }
    }
    return this.modalInstance;
  }

  loadData(): void {
    this.isLoading.set(true);
    this.incidentTypeService.getAll().subscribe({
      next: (data) => {
        this.items.set(data);
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
      this.filteredItems.set(this.items());
      return;
    }
    this.filteredItems.set(
      this.items().filter((item) => item.name.toLowerCase().includes(term))
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

  editItem(item: any): void {
    this.isEditMode.set(true);
    this.errorMsg.set(null);
    this.formData = { ...item };
    this.getModal()?.show();
  }

  saveData(): void {
    if (this.isEditMode()) {
      this.incidentTypeService.update(this.formData.id!, this.formData).subscribe({
        next: () => {
          this.loadData();
          this.getModal()?.hide();
          this.successMsg.set('Tipo guardado exitosamente');
          setTimeout(() => this.successMsg.set(null), 2000);
        },
        error: (err) => {
          this.errorMsg.set(err.error?.message || 'Error al actualizar');
        }
      });
    } else {
      this.incidentTypeService.create(this.formData).subscribe({
        next: () => {
          this.loadData();
          this.getModal()?.hide();
          this.successMsg.set('Tipo guardado exitosamente');
          setTimeout(() => this.successMsg.set(null), 2000);
        },
        error: (err) => {
          this.errorMsg.set(err.error?.message || 'Error al crear');
        }
      });
    }
  }
}
