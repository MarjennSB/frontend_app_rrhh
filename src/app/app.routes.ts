import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { guestGuard } from './core/guards/guest-guard';
import { rolesGuard } from './core/guards/roles-guard';
import { LayoutComponent } from './shared/layout/layout';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
    },
    {
        path: 'auth/login',
        canActivate: [guestGuard],
        loadComponent: () => import('./features/auth/login/login').then(c => c.Login)
    },
    {
        path: '',
        component: LayoutComponent,
        canActivate: [authGuard],
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./features/dashboard/dashboard').then(c => c.DashboardComponent)
            },
            {
                path: 'users',
                canActivate: [rolesGuard],
                data: { roles: ['Administrador'] },
                loadComponent: () => import('./features/users/users-list/users-list').then(c => c.UsersListComponent)
            },
            {
                path: 'users/create',
                canActivate: [rolesGuard],
                data: { roles: ['Administrador'] },
                loadComponent: () => import('./features/users/user-form/user-form').then(c => c.UserForm)
            },
            {
                path: 'persons',
                loadComponent: () => import('./features/persons/persons-list/persons-list').then(c => c.PersonsListComponent)
            },
            {
                path: 'persons/create',
                loadComponent: () => import('./features/persons/person-form/person-form').then(c => c.PersonForm)
            },
            {
                path: 'personal',
                loadComponent: () => import('./features/personal/personal-list/personal-list').then(c => c.PersonalListComponent)
            },
            {
                path: 'personal/create',
                loadComponent: () => import('./features/personal/personal-form/personal-form').then(c => c.PersonalForm)
            },
            {
                path: 'contracts',
                loadComponent: () => import('./features/contracts/contracts-list/contracts-list').then(c => c.ContractsListComponent)
            },
            {
                path: 'contracts/create',
                loadComponent: () => import('./features/contracts/contract-form/contract-form').then(c => c.ContractForm)
            },
            {
                path: 'attendance',
                loadComponent: () => import('./features/attendance/attendance-list/attendance-list').then(c => c.AttendanceList)
            },
            {
                path: 'attendance/create',
                loadComponent: () => import('./features/attendance/attendance-form/attendance-form').then(c => c.AttendanceForm)
            },
            {
                path: 'maintenance/horarios',
                canActivate: [rolesGuard],
                data: { roles: ['Administrador'] },
                loadComponent: () => import('./features/maintenance/schedules/schedules-list').then(c => c.SchedulesListComponent)
            },
            {
                path: 'maintenance/areas',
                canActivate: [rolesGuard],
                data: { roles: ['Administrador'] },
                loadComponent: () => import('./features/maintenance/areas/areas-list').then(c => c.AreasListComponent)
            },
            {
                path: 'maintenance/cargos',
                canActivate: [rolesGuard],
                data: { roles: ['Administrador'] },
                loadComponent: () => import('./features/maintenance/cargos/cargos-list').then(c => c.CargosListComponent)
            },
            {
                path: 'maintenance/tipos-contrato',
                canActivate: [rolesGuard],
                data: { roles: ['Administrador'] },
                loadComponent: () => import('./features/maintenance/contract-types/contract-types-list').then(c => c.ContractTypesListComponent)
            },
            {
                path: 'maintenance/tipos-vacaciones',
                canActivate: [rolesGuard],
                data: { roles: ['Administrador'] },
                loadComponent: () => import('./features/maintenance/vacation-types/vacation-types-list').then(c => c.VacationTypesListComponent)
            },
            {
                path: 'maintenance/tipos-permisos',
                canActivate: [rolesGuard],
                data: { roles: ['Administrador'] },
                loadComponent: () => import('./features/maintenance/incident-types/incident-types-list').then(c => c.IncidentTypesListComponent)
            },
            {
                path: 'maintenance/tipos-asistencia',
                canActivate: [rolesGuard],
                data: { roles: ['Administrador'] },
                loadComponent: () => import('./features/maintenance/attendance-types/attendance-types-list').then(c => c.AttendanceTypesListComponent)
            },
            {
                path: 'vacations',
                loadComponent: () => import('./features/vacations/vacations-list/vacations-list').then(c => c.VacationsList)
            },
            {
                path: 'vacations/create',
                loadComponent: () => import('./features/vacations/vacation-form/vacation-form').then(c => c.VacationForm)
            },
            {
                path: 'incidents',
                loadComponent: () => import('./features/incidents/incidents-list/incidents-list').then(c => c.IncidentsList)
            },
            {
                path: 'incidents/create',
                loadComponent: () => import('./features/incidents/incident-form/incident-form').then(c => c.IncidentForm)
            },
            {
                path: 'personal-documents',
                loadComponent: () => import('./features/personal-documents/personal-documents-list/personal-documents-list').then(c => c.PersonalDocumentsListComponent)
            },
            {
                path: 'personal-documents/create',
                loadComponent: () => import('./features/personal-documents/personal-document-form/personal-document-form').then(c => c.PersonalDocumentForm)
            },
            {
                path: 'profile',
                loadComponent: () => import('./features/profile/profile').then(c => c.ProfileComponent)
            },
            {
                path: 'unauthorized',
                loadComponent: () => import('./features/unauthorized/unauthorized').then(c => c.UnauthorizedComponent)
            }
        ]
    },
    {
        path: '**',
        redirectTo: 'auth/login'
    }
];
