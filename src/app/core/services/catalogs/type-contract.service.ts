import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TypeContract } from '../../models/type-contract.model';

@Injectable({ providedIn: 'root' })
export class TypeContractService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/type-contract`;

  getAll(): Observable<TypeContract[]> {
    return this.http.get<TypeContract[]>(`${this.baseUrl}`);
  }

  getById(id: number | string): Observable<TypeContract> {
    return this.http.get<TypeContract>(`${this.baseUrl}/${id}`);
  }

  create(data: Partial<TypeContract>): Observable<TypeContract> {
    return this.http.post<TypeContract>(`${this.baseUrl}`, data);
  }

  update(id: number | string, data: Partial<TypeContract>): Observable<TypeContract> {
    return this.http.patch<TypeContract>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
