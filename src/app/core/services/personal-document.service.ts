import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PersonalDocument } from '../models/personal-document.model';

@Injectable({ providedIn: 'root' })
export class PersonalDocumentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/personal-documents`;

  getAll(): Observable<PersonalDocument[]> {
    return this.http.get<PersonalDocument[]>(`${this.baseUrl}`);
  }

  getById(id: number | string): Observable<PersonalDocument> {
    return this.http.get<PersonalDocument>(`${this.baseUrl}/${id}`);
  }

  create(data: Partial<PersonalDocument> | FormData): Observable<PersonalDocument> {
    return this.http.post<PersonalDocument>(`${this.baseUrl}`, data);
  }

  update(id: number | string, data: Partial<PersonalDocument> | FormData): Observable<PersonalDocument> {
    return this.http.patch<PersonalDocument>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
