import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AttendanceRoster {
  id: number;
  personal_id: number;
  personal?: any;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class AttendanceRosterService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/attendance-roster`;

  getAll(): Observable<AttendanceRoster[]> {
    return this.http.get<AttendanceRoster[]>(`${this.baseUrl}`);
  }

  addPersonal(personal_id: number): Observable<AttendanceRoster> {
    return this.http.post<AttendanceRoster>(`${this.baseUrl}`, { personal_id });
  }

  removePersonal(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
