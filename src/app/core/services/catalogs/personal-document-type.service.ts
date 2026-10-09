import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PersonalDocumentType } from '../../models/personal-document-type.model';

@Injectable({ providedIn: 'root' })
export class PersonalDocumentTypeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/personal-document-types`;

  getAll(): Observable<PersonalDocumentType[]> {
    return this.http.get<PersonalDocumentType[]>(`${this.baseUrl}`);
  }

  getById(id: number | string): Observable<PersonalDocumentType> {
    return this.http.get<PersonalDocumentType>(`${this.baseUrl}/${id}`);
  }

  create(data: Partial<PersonalDocumentType>): Observable<PersonalDocumentType> {
    return this.http.post<PersonalDocumentType>(`${this.baseUrl}`, data);
  }

  update(id: number | string, data: Partial<PersonalDocumentType>): Observable<PersonalDocumentType> {
    return this.http.patch<PersonalDocumentType>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
