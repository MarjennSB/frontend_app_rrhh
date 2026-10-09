import { Component, inject, OnInit, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { UsersService } from '../../../core/services/users.service';
import { User } from '../../../core/models/user.model';
import { Role } from '../../../core/models/role.model';

declare const bootstrap: any;

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './users-list.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class UsersListComponent implements OnInit {
  private readonly usersService = inject(UsersService);
  private readonly fb = inject(FormBuilder);

  users = signal<User[]>([]);
  filteredUsers = signal<User[]>([]);
  isLoading = signal(false);
  errorMsg = signal<string | null>(null);
  successMsg = signal<string | null>(null);
  isEditing = signal(false);
  editingId = signal<number | null>(null);
  searchTerm = signal('');
  showPassword = signal(false);

  availableRoles = signal<Role[]>([]);

  readonly userForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    password: ['', [Validators.minLength(6)]],
    first_name: ['', [Validators.required, Validators.maxLength(150)]],
    last_name: ['', [Validators.maxLength(100)]],
    role_id: [0, [Validators.required, Validators.min(1)]],
    status: [true],
  });

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
  }

  loadRoles(): void {
    this.usersService.getRoles().subscribe({
      next: (roles) => this.availableRoles.set(roles),
    });
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.usersService.getAll().subscribe({
      next: (data) => {
        console.log('Usuarios recibidos del API:', data);
        this.users.set(data);
        this.applyFilter();
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        this.errorMsg.set('Error al cargar los usuarios: ' + (err.error?.message || err.message));
        this.isLoading.set(false);
      },
    });
  }

  applyFilter(): void {
    const term = this.searchTerm().toLowerCase();
    if (!term) {
      this.filteredUsers.set(this.users());
      return;
    }
    this.filteredUsers.set(
      this.users().filter(
        (u) =>
          (u.email?.toLowerCase().includes(term)) ||
          (u.first_name ?? '').toLowerCase().includes(term) ||
          (u.last_name ?? '').toLowerCase().includes(term)
      )
    );
  }

  onSearch(value: string): void {
    this.searchTerm.set(value);
    this.applyFilter();
  }

  openCreateModal(): void {
    this.isEditing.set(false);
    this.editingId.set(null);
    this.userForm.reset({ email: '', password: '', first_name: '', last_name: '', role_id: 0, status: true });
    this.userForm.controls.password.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.controls.password.updateValueAndValidity();
    this.errorMsg.set(null);
    this.getModal().show();
  }

  openEditModal(user: User): void {
    this.isEditing.set(true);
    this.editingId.set(user.id);
    this.userForm.reset({
      email: user.email || '',
      password: '',
      first_name: user.first_name ?? '',
      last_name: user.last_name ?? '',
      role_id: user.role_id,
      status: user.status,
    });
    this.userForm.controls.password.clearValidators();
    this.userForm.controls.password.updateValueAndValidity();
    this.errorMsg.set(null);
    this.getModal().show();
  }

  saveUser(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }
    const { email, password, first_name, last_name, role_id, status } = this.userForm.getRawValue();

    if (this.isEditing() && this.editingId() !== null) {
      const dto: any = { email, first_name, last_name, role_id, status };
      if (password) dto.password = password;
      this.usersService.update(this.editingId()!.toString(), dto).subscribe({
        next: () => { this.getModal().hide(); this.showSuccess('Usuario actualizado.'); this.loadUsers(); },
        error: (err) => this.errorMsg.set(err?.error?.message || 'Error al actualizar.'),
      });
    } else {
      this.usersService.create({ email, password, first_name, last_name, role_id, status }).subscribe({
        next: () => { this.getModal().hide(); this.showSuccess('Usuario creado.'); this.loadUsers(); },
        error: (err) => this.errorMsg.set(err?.error?.message || 'Error al crear.'),
      });
    }
  }

  toggleActive(user: User): void {
    this.usersService.toggleActive(user.id.toString(), user.status).subscribe({
      next: () => { this.showSuccess(`Usuario ${user.status ? 'desactivado' : 'activado'}.`); this.loadUsers(); },
      error: () => this.errorMsg.set('Error al cambiar estado.'),
    });
  }

  getFullName(user: User): string {
    return [user.first_name, user.last_name].filter(v => !!v).join(' ') || '—';
  }

  getRoleNames(user: User): string {
    return user.role?.name || '—';
  }

  isFieldInvalid(field: 'email' | 'password' | 'role_id' | 'first_name' | 'last_name'): boolean {
    const control = this.userForm.controls[field];
    return control.invalid && control.touched;
  }

  private showSuccess(msg: string): void {
    this.successMsg.set(msg);
    setTimeout(() => this.successMsg.set(null), 2000);
  }

  private getModal(): any {
    return bootstrap.Modal.getOrCreateInstance(document.getElementById('userModal'));
  }
}
