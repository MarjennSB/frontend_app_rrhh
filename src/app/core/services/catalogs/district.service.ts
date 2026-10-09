import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { District } from '../../models/district.model';

@Injectable({ providedIn: 'root' })
export class DistrictService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/districts`;

  getAll(): Observable<District[]> {
    return this.http.get<District[]>(`${this.baseUrl}`);
  }

  getById(id: number | string): Observable<District> {
    return this.http.get<District>(`${this.baseUrl}/${id}`);
  }

  create(data: Partial<District>): Observable<District> {
    return this.http.post<District>(`${this.baseUrl}`, data);
  }

  update(id: number | string, data: Partial<District>): Observable<District> {
    return this.http.patch<District>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
