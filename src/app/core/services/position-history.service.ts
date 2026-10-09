import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PositionHistory } from '../models/position-history.model';

@Injectable({ providedIn: 'root' })
export class PositionHistoryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/position-historys`;

  getAll(): Observable<PositionHistory[]> {
    return this.http.get<PositionHistory[]>(`${this.baseUrl}`);
  }

  getById(id: number | string): Observable<PositionHistory> {
    return this.http.get<PositionHistory>(`${this.baseUrl}/${id}`);
  }

  create(data: Partial<PositionHistory>): Observable<PositionHistory> {
    return this.http.post<PositionHistory>(`${this.baseUrl}`, data);
  }

  update(id: number | string, data: Partial<PositionHistory>): Observable<PositionHistory> {
    return this.http.patch<PositionHistory>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
