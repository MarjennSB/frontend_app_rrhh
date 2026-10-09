import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TypeAttendance } from '../../models/type-attendance.model';

@Injectable({ providedIn: 'root' })
export class TypeAttendanceService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/type-attendance`;

  getAll(): Observable<TypeAttendance[]> {
    return this.http.get<TypeAttendance[]>(`${this.baseUrl}`);
  }

  getById(id: number | string): Observable<TypeAttendance> {
    return this.http.get<TypeAttendance>(`${this.baseUrl}/${id}`);
  }

  create(data: Partial<TypeAttendance>): Observable<TypeAttendance> {
    return this.http.post<TypeAttendance>(`${this.baseUrl}`, data);
  }

  update(id: number | string, data: Partial<TypeAttendance>): Observable<TypeAttendance> {
    return this.http.patch<TypeAttendance>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
