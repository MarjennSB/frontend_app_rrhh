import { Component, inject, OnInit, signal, Input, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { PersonalDocumentService } from '../../../core/services/personal-document.service';
import { PersonalService } from '../../../core/services/personal.service';
import { PersonalDocumentTypeService } from '../../../core/services/catalogs/personal-document-type.service';
import { PersonalDocument } from '../../../core/models/personal-document.model';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';

declare const bootstrap: any;

@Component({
  selector: 'app-personal-documents-list',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './personal-documents-list.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PersonalDocumentsListComponent implements OnInit {
  @Input() isModalMode: boolean = false;
  
  private _personalId: number | null = null;
  @Input() set personalId(value: number | null) {
    this._personalId = value;
    if (this.documents().length > 0) {
      this.applyFilter();
    }
  }
  get personalId(): number | null {
    return this._personalId;
  }
  private readonly personalDocumentService = inject(PersonalDocumentService);
  private readonly personalService = inject(PersonalService);
  private readonly documentTypeService = inject(PersonalDocumentTypeService);
  private readonly fb = inject(FormBuilder);

  documents = signal<PersonalDocument[]>([]);
  filteredDocuments = signal<PersonalDocument[]>([]);
  isLoading = signal(false);
  errorMsg = signal<string | null>(null);
  successMsg = signal<string | null>(null);
  warningMsg = signal<string | null>(null);
  isEditing = signal(false);
  editingId = signal<number | null>(null);
  currentFileName = signal<string>('');
  searchTerm = signal('');

  availablePersonals = signal<any[]>([]);
  availableDocumentTypes = signal<any[]>([]);

  readonly documentForm = this.fb.nonNullable.group({
    personal_id: [0, [Validators.required, Validators.min(1)]],
    personal_document_type_id: [0, [Validators.required, Validators.min(1)]],
    document_date: ['', [Validators.required]],
    status: [true]
  });

  private modalInstance: any;

  ngOnInit(): void {
    this.loadDocuments();
    this.loadCatalogs();
  }

  getModal(): any {
    if (!this.modalInstance) {
      const el = document.getElementById('documentModal');
      if (el) {
        this.modalInstance = new bootstrap.Modal(el);
      }
    }
    return this.modalInstance;
  }

  loadDocuments(): void {
    this.isLoading.set(true);
    this.personalDocumentService.getAll().subscribe({
      next: (data) => {
        this.documents.set(data);
        this.applyFilter();
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMsg.set('Error al cargar la lista de documentos');
        this.isLoading.set(false);
      },
    });
  }

  loadCatalogs(): void {
    this.personalService.getAll().subscribe({
      next: (data) => this.availablePersonals.set(data),
      error: () => console.error('Error al cargar asignaciones de personal')
    });
    this.documentTypeService.getAll().subscribe({
      next: (data) => this.availableDocumentTypes.set(data),
      error: () => console.error('Error al cargar tipos de documento')
    });
  }

  applyFilter(): void {
    let docs = this.documents();
    
    if (this.isModalMode && this.personalId !== null) {
      docs = docs.filter(d => d.personal_id === this.personalId);
    }

    const term = this.searchTerm().toLowerCase();
    if (!term) {
      this.filteredDocuments.set(docs);
      return;
    }

    this.filteredDocuments.set(
      docs.filter((d) => {
        const docNum = d.personal?.person?.document_number?.toLowerCase() || '';
        const name = `${d.personal?.person?.first_name} ${d.personal?.person?.last_name}`.toLowerCase();
        const type = d.personal_document_type?.name?.toLowerCase() || '';
        const fName = d.file_name?.toLowerCase() || '';
        return docNum.includes(term) || name.includes(term) || type.includes(term) || fName.includes(term);
      })
    );
  }

  onSearch(value: string): void {
    this.searchTerm.set(value);
    this.applyFilter();
  }

  get unassignedDocumentTypes(): any[] {
    const selectedPersonalId = Number(this.documentForm.get('personal_id')?.value);
    if (!selectedPersonalId) return this.availableDocumentTypes();

    const existingDocTypeIds = this.documents()
      .filter(d => d.personal_id === selectedPersonalId && (!this.isEditing() || d.id !== this.editingId()))
      .map(d => Number(d.personal_document_type_id));

    const currentSelectedTypeId = Number(this.documentForm.get('personal_document_type_id')?.value);

    return this.availableDocumentTypes().filter(dt => {
      const dtId = Number(dt.id);
      // Incluir si no está asignado a otro doc, o si estamos editando y es exactamente el que ya tiene seleccionado
      return !existingDocTypeIds.includes(dtId) || (this.isEditing() && dtId === currentSelectedTypeId);
    });
  }

  openCreateModal(): void {
    this.isEditing.set(false);
    this.editingId.set(null);
    this.currentFileName.set('');
    this.selectedFile = null;
    this.documentForm.reset({
      personal_id: this.isModalMode && this.personalId !== null ? this.personalId : 0,
      personal_document_type_id: 0,
      document_date: '',
      status: true
    });
    this.errorMsg.set(null);
    this.getModal()?.show();
  }

  openEditModal(doc: PersonalDocument): void {
    this.isEditing.set(true);
    this.editingId.set(doc.id);
    this.currentFileName.set(doc.file_name || '');
    this.selectedFile = null;
    this.documentForm.reset({
      personal_id: doc.personal_id,
      personal_document_type_id: doc.personal_document_type_id,
      document_date: doc.document_date ? new Date(doc.document_date).toISOString().split('T')[0] : '',
      status: doc.status
    });
    this.errorMsg.set(null);
    this.getModal()?.show();
  }

  toggleActive(doc: PersonalDocument): void {
    const newStatus = !doc.status;
    this.personalDocumentService.update(doc.id, { status: newStatus }).subscribe({
      next: () => {
        if (newStatus) {
          this.successMsg.set('Documento activado con éxito');
          setTimeout(() => this.successMsg.set(null), 2000);
        } else {
          this.warningMsg.set('Documento desactivado con éxito');
          setTimeout(() => this.warningMsg.set(null), 2000);
        }
        this.loadDocuments();
      },
      error: () => {
        this.errorMsg.set('Error al cambiar el estado del documento');
        setTimeout(() => this.errorMsg.set(null), 2000);
      },
    });
  }

  selectedFile: File | null = null;

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  getFileUrl(path: string | undefined): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseUrl = environment.apiUrl.replace(/\/api.*$/, '');
    return `${baseUrl}${path}`;
  }

  saveDocument(): void {
    if (this.documentForm.invalid && !this.selectedFile && !this.isEditing()) {
      this.documentForm.markAllAsTouched();
      return;
    }
    const rawData = this.documentForm.getRawValue();
    
    // Si estamos creando y tenemos archivo, usamos FormData
    // Para simplificar, en modo edición si no hay archivo podemos mandar JSON.
    // Pero como actualizamos el controlador a FileInterceptor, SIEMPRE mandaremos FormData o el controlador fallará si no envía multipart
    // Wait, el controlador está configurado para @UseInterceptors(FileInterceptor('file')) en @Post().
    // En @Patch() sigue usando JSON normal en el backend!
    
    if (!this.isEditing()) {
      // POST -> FormData
      const formData = new FormData();
      formData.append('personal_id', String(rawData.personal_id));
      formData.append('personal_document_type_id', String(rawData.personal_document_type_id));
      formData.append('document_date', rawData.document_date);
      formData.append('status', String(rawData.status));
      if (this.selectedFile) {
        formData.append('file', this.selectedFile);
      }
      
      this.personalDocumentService.create(formData).subscribe({
        next: () => {
          this.successMsg.set('Documento registrado exitosamente');
          setTimeout(() => this.successMsg.set(null), 2000);
          this.getModal()?.hide();
          this.loadDocuments();
        },
        error: (err) => {
          this.errorMsg.set(err.error?.message || 'Error al registrar el documento');
          setTimeout(() => this.errorMsg.set(null), 2000);
        },
      });
    } else {
      // PATCH -> FormData
      const formData = new FormData();
      formData.append('personal_document_type_id', String(rawData.personal_document_type_id));
      formData.append('status', String(rawData.status));
      if (rawData.document_date) {
        formData.append('document_date', rawData.document_date);
      }
      if (this.selectedFile) {
        formData.append('file', this.selectedFile);
      }

      this.personalDocumentService.update(this.editingId()!, formData).subscribe({
        next: () => {
          this.successMsg.set('Documento actualizado exitosamente');
          setTimeout(() => this.successMsg.set(null), 2000);
          this.getModal()?.hide();
          this.loadDocuments();
        },
        error: (err) => {
          this.errorMsg.set(err.error?.message || 'Error al actualizar el documento');
          setTimeout(() => this.errorMsg.set(null), 2000);
        },
      });
    }
  }


  isFieldInvalid(field: string): boolean {
    const control = this.documentForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
