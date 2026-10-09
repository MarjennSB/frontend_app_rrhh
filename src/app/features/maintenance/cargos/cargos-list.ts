import { Component, inject, OnInit, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PositionService } from '../../../core/services/catalogs/position.service';
import { Position } from '../../../core/models/position.model';
import { OrganizationalUnitService } from '../../../core/services/catalogs/organizational-unit.service';

declare const bootstrap: any;

@Component({
  selector: 'app-cargos-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cargos-list.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CargosListComponent implements OnInit {
  private readonly positionService = inject(PositionService);
  private readonly orgUnitService = inject(OrganizationalUnitService);

  positions = signal<Position[]>([]);
  filteredPositions = signal<Position[]>([]);
  organizationalUnits = signal<any[]>([]);
  
  isLoading = signal(false);
  searchTerm = signal('');

  isEditMode = signal(false);
  successMsg = signal<string | null>(null);
  errorMsg = signal<string | null>(null);
  formData: Partial<Position> = {};

  private modalInstance: any;

  ngOnInit(): void {
    this.loadData();
    this.loadOrgUnits();
  }

  getModal(): any {
    if (!this.modalInstance) {
      const el = document.getElementById('showModalCargos');
      if (el) {
        this.modalInstance = new bootstrap.Modal(el);
      }
    }
    return this.modalInstance;
  }

  loadData(): void {
    this.isLoading.set(true);
    this.positionService.getAll().subscribe({
      next: (data) => {
        this.positions.set(data);
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
      this.filteredPositions.set(this.positions());
      return;
    }
    this.filteredPositions.set(
      this.positions().filter((item) => {
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
      organizational_unit_id: '' as any,
      status: true
    };
    this.getModal()?.show();
  }

  editItem(item: Position): void {
    this.isEditMode.set(true);
    this.errorMsg.set(null);
    this.formData = { ...item };
    this.getModal()?.show();
  }

  saveData(): void {
    if (this.isEditMode()) {
      this.positionService.update(this.formData.id!, this.formData).subscribe({
        next: () => {
          this.loadData();
          this.getModal()?.hide();
          this.successMsg.set('Cargo guardado exitosamente');
          setTimeout(() => this.successMsg.set(null), 2000);
        },
        error: (err) => {
          this.errorMsg.set(err.error?.message || 'Error al actualizar el cargo');
        }
      });
    } else {
      this.positionService.create(this.formData).subscribe({
        next: () => {
          this.loadData();
          this.getModal()?.hide();
          this.successMsg.set('Cargo guardado exitosamente');
          setTimeout(() => this.successMsg.set(null), 2000);
        },
        error: (err) => {
          this.errorMsg.set(err.error?.message || 'Error al crear el cargo');
        }
      });
    }
  }
}
