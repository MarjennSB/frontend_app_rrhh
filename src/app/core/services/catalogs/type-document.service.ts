import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TypeDocument } from '../../models/type-document.model';

@Injectable({ providedIn: 'root' })
export class TypeDocumentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/type-document`;

  getAll(): Observable<TypeDocument[]> {
    return this.http.get<TypeDocument[]>(`${this.baseUrl}/all`);
  }

  getById(id: number | string): Observable<TypeDocument> {
    return this.http.get<TypeDocument>(`${this.baseUrl}/${id}`);
  }

  create(data: Partial<TypeDocument>): Observable<TypeDocument> {
    return this.http.post<TypeDocument>(`${this.baseUrl}`, data);
  }

  update(id: number | string, data: Partial<TypeDocument>): Observable<TypeDocument> {
    return this.http.patch<TypeDocument>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
