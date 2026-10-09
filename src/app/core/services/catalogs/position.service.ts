import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Position } from '../../models/position.model';

@Injectable({ providedIn: 'root' })
export class PositionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/positions`;

  getAll(): Observable<Position[]> {
    return this.http.get<Position[]>(`${this.baseUrl}`);
  }

  getByUnit(unitId: number): Observable<Position[]> {
    return this.http.get<Position[]>(`${this.baseUrl}/by-unit/${unitId}`);
  }

  getById(id: number | string): Observable<Position> {
    return this.http.get<Position>(`${this.baseUrl}/${id}`);
  }

  create(data: Partial<Position>): Observable<Position> {
    return this.http.post<Position>(`${this.baseUrl}`, data);
  }

  update(id: number | string, data: Partial<Position>): Observable<Position> {
    return this.http.patch<Position>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
