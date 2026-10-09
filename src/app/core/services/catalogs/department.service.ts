import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Department } from '../../models/department.model';

@Injectable({ providedIn: 'root' })
export class DepartmentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/departments`;

  getAll(): Observable<Department[]> {
    return this.http.get<Department[]>(`${this.baseUrl}`);
  }

  getById(id: number | string): Observable<Department> {
    return this.http.get<Department>(`${this.baseUrl}/${id}`);
  }

  create(data: Partial<Department>): Observable<Department> {
    return this.http.post<Department>(`${this.baseUrl}`, data);
  }

  update(id: number | string, data: Partial<Department>): Observable<Department> {
    return this.http.patch<Department>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
