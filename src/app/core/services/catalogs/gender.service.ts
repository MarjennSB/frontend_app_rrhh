import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Gender } from '../../models/gender.model';

@Injectable({ providedIn: 'root' })
export class GenderService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/gender`;

  getAll(): Observable<Gender[]> {
    return this.http.get<Gender[]>(`${this.baseUrl}`);
  }

  getById(id: number | string): Observable<Gender> {
    return this.http.get<Gender>(`${this.baseUrl}/${id}`);
  }

  create(data: Partial<Gender>): Observable<Gender> {
    return this.http.post<Gender>(`${this.baseUrl}`, data);
  }

  update(id: number | string, data: Partial<Gender>): Observable<Gender> {
    return this.http.patch<Gender>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
