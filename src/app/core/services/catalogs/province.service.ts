import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Province } from '../../models/province.model';

@Injectable({ providedIn: 'root' })
export class ProvinceService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/provinces`;

  getAll(): Observable<Province[]> {
    return this.http.get<Province[]>(`${this.baseUrl}`);
  }

  getById(id: number | string): Observable<Province> {
    return this.http.get<Province>(`${this.baseUrl}/${id}`);
  }

  create(data: Partial<Province>): Observable<Province> {
    return this.http.post<Province>(`${this.baseUrl}`, data);
  }

  update(id: number | string, data: Partial<Province>): Observable<Province> {
    return this.http.patch<Province>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
