import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Contract } from '../models/contract.model';

@Injectable({ providedIn: 'root' })
export class ContractService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/contract`;

  getAll(): Observable<Contract[]> {
    return this.http.get<Contract[]>(`${this.baseUrl}`);
  }

  getById(id: number | string): Observable<Contract> {
    return this.http.get<Contract>(`${this.baseUrl}/${id}`);
  }

  create(data: Partial<Contract>): Observable<Contract> {
    return this.http.post<Contract>(`${this.baseUrl}`, data);
  }

  update(id: number | string, data: Partial<Contract>): Observable<Contract> {
    return this.http.patch<Contract>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
