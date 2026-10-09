import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Personal } from '../models/personal.model';

@Injectable({ providedIn: 'root' })
export class PersonalService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/personal`;

  getAll(): Observable<Personal[]> {
    return this.http.get<Personal[]>(`${this.baseUrl}`);
  }

  getById(id: number | string): Observable<Personal> {
    return this.http.get<Personal>(`${this.baseUrl}/${id}`);
  }

  create(data: Partial<Personal>): Observable<Personal> {
    return this.http.post<Personal>(`${this.baseUrl}`, data);
  }

  update(id: number | string, data: Partial<Personal>): Observable<Personal> {
    return this.http.patch<Personal>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
