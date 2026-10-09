import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Person } from '../models/person.model';

@Injectable({ providedIn: 'root' })
export class PersonService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/persons`;

  getAll(): Observable<Person[]> {
    return this.http.get<Person[]>(`${this.baseUrl}`);
  }

  getById(id: number | string): Observable<Person> {
    return this.http.get<Person>(`${this.baseUrl}/${id}`);
  }

  create(data: Partial<Person>): Observable<Person> {
    return this.http.post<Person>(`${this.baseUrl}`, data);
  }

  update(id: number | string, data: Partial<Person>): Observable<Person> {
    return this.http.patch<Person>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
