import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Vacation } from '../models/vacation.model';

@Injectable({ providedIn: 'root' })
export class VacationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/vacation`;

  getAll(): Observable<Vacation[]> {
    return this.http.get<Vacation[]>(`${this.baseUrl}`);
  }

  getById(id: number | string): Observable<Vacation> {
    return this.http.get<Vacation>(`${this.baseUrl}/${id}`);
  }

  create(data: Partial<Vacation>): Observable<Vacation> {
    return this.http.post<Vacation>(`${this.baseUrl}`, data);
  }

  update(id: number | string, data: Partial<Vacation>): Observable<Vacation> {
    return this.http.patch<Vacation>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
