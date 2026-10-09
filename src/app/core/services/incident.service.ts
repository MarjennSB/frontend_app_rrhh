import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Incident } from '../models/incident.model';

@Injectable({ providedIn: 'root' })
export class IncidentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/incident`;

  getAll(): Observable<Incident[]> {
    return this.http.get<Incident[]>(`${this.baseUrl}`);
  }

  getById(id: number | string): Observable<Incident> {
    return this.http.get<Incident>(`${this.baseUrl}/${id}`);
  }

  create(data: Partial<Incident>): Observable<Incident> {
    return this.http.post<Incident>(`${this.baseUrl}`, data);
  }

  update(id: number | string, data: Partial<Incident>): Observable<Incident> {
    return this.http.patch<Incident>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
