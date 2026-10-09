import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Schedule } from '../../models/schedule.model';

@Injectable({ providedIn: 'root' })
export class ScheduleService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/schedules`;

  getAll(): Observable<Schedule[]> {
    return this.http.get<Schedule[]>(`${this.baseUrl}`);
  }

  getById(id: number | string): Observable<Schedule> {
    return this.http.get<Schedule>(`${this.baseUrl}/${id}`);
  }

  create(data: Partial<Schedule>): Observable<Schedule> {
    return this.http.post<Schedule>(`${this.baseUrl}`, data);
  }

  update(id: number | string, data: Partial<Schedule>): Observable<Schedule> {
    return this.http.patch<Schedule>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
