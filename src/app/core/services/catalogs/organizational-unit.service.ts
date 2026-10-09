import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { OrganizationalUnit } from '../../models/organizational-unit.model';

@Injectable({ providedIn: 'root' })
export class OrganizationalUnitService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/organizational-units`;

  getAll(): Observable<OrganizationalUnit[]> {
    return this.http.get<OrganizationalUnit[]>(`${this.baseUrl}`);
  }

  getById(id: number | string): Observable<OrganizationalUnit> {
    return this.http.get<OrganizationalUnit>(`${this.baseUrl}/${id}`);
  }

  create(data: Partial<OrganizationalUnit>): Observable<OrganizationalUnit> {
    return this.http.post<OrganizationalUnit>(`${this.baseUrl}`, data);
  }

  update(id: number | string, data: Partial<OrganizationalUnit>): Observable<OrganizationalUnit> {
    return this.http.patch<OrganizationalUnit>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
