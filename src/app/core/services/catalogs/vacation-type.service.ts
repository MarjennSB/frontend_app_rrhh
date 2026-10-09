import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { VacationType } from '../../models/vacation-type.model';

@Injectable({ providedIn: 'root' })
export class VacationTypeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/vacation-types`;

  getAll(): Observable<VacationType[]> {
    return this.http.get<VacationType[]>(`${this.baseUrl}`);
  }

  getById(id: number | string): Observable<VacationType> {
    return this.http.get<VacationType>(`${this.baseUrl}/${id}`);
  }

  create(data: Partial<VacationType>): Observable<VacationType> {
    return this.http.post<VacationType>(`${this.baseUrl}`, data);
  }

  update(id: number | string, data: Partial<VacationType>): Observable<VacationType> {
    return this.http.patch<VacationType>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
