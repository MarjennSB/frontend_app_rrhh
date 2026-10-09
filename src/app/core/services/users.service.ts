import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, CreateUserDto, UpdateUserDto } from '../models/user.model';
import { Role } from '../models/role.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/user`;
  private readonly rolesUrl = `${environment.apiUrl}/role`;

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl);
  }

  getById(id: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateUserDto): Observable<User> {
    return this.http.post<User>(this.baseUrl, dto);
  }

  update(id: string, dto: UpdateUserDto): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/${id}`, dto);
  }

  toggleActive(id: string, currentStatus: boolean): Observable<User> {
    // En nuestro backend, para desactivar mandamos status en false a través de PATCH
    return this.http.patch<User>(`${this.baseUrl}/${id}`, { status: !currentStatus });
  }

  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.rolesUrl);
  }
}
