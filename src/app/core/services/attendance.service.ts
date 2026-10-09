import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Attendance } from '../models/attendance.model';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/attendance`;

  getAll(): Observable<Attendance[]> {
    return this.http.get<Attendance[]>(`${this.baseUrl}`);
  }

  getById(id: number | string): Observable<Attendance> {
    return this.http.get<Attendance>(`${this.baseUrl}/${id}`);
  }

  create(data: Partial<Attendance>): Observable<Attendance> {
    return this.http.post<Attendance>(`${this.baseUrl}`, data);
  }

  update(id: number | string, data: Partial<Attendance>): Observable<Attendance> {
    return this.http.patch<Attendance>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
