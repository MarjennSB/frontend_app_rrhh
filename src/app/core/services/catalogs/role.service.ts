import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Role } from '../../models/role.model';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/role`;

  getAll(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.baseUrl}`);
  }

  getById(id: number | string): Observable<Role> {
    return this.http.get<Role>(`${this.baseUrl}/${id}`);
  }

  create(data: Partial<Role>): Observable<Role> {
    return this.http.post<Role>(`${this.baseUrl}`, data);
  }

  update(id: number | string, data: Partial<Role>): Observable<Role> {
    return this.http.patch<Role>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
