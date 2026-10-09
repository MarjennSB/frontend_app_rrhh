import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IncidentType } from '../../models/incident-type.model';

@Injectable({ providedIn: 'root' })
export class IncidentTypeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/incident-types`;

  getAll(): Observable<IncidentType[]> {
    return this.http.get<IncidentType[]>(`${this.baseUrl}`);
  }

  getById(id: number | string): Observable<IncidentType> {
    return this.http.get<IncidentType>(`${this.baseUrl}/${id}`);
  }

  create(data: Partial<IncidentType>): Observable<IncidentType> {
    return this.http.post<IncidentType>(`${this.baseUrl}`, data);
  }

  update(id: number | string, data: Partial<IncidentType>): Observable<IncidentType> {
    return this.http.patch<IncidentType>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
