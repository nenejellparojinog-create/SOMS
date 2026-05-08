import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { guestGuard } from './guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent),
      },
    ],
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./components/layout/shell/shell.component').then(m => m.ShellComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'organizations',
        loadComponent: () => import('./pages/organizations/organization-list/organization-list.component').then(m => m.OrganizationListComponent),
      },
      {
        path: 'organizations/:id',
        loadComponent: () => import('./pages/organizations/organization-detail/organization-detail.component').then(m => m.OrganizationDetailComponent),
      },
      {
        path: 'events',
        loadComponent: () => import('./pages/events/event-list/event-list.component').then(m => m.EventListComponent),
      },
      {
        path: 'events/:id',
        loadComponent: () => import('./pages/events/event-detail/event-detail.component').then(m => m.EventDetailComponent),
      },
      {
        path: 'documents',
        loadComponent: () => import('./pages/documents/document-list/document-list.component').then(m => m.DocumentListComponent),
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
      },
      {
        path: 'admin',
        canActivate: [adminGuard],
        loadComponent: () => import('./pages/admin/admin-panel/admin-panel.component').then(m => m.AdminPanelComponent),
      },
      {
        path: 'admin/organizations',
        canActivate: [adminGuard],
        loadComponent: () => import('./pages/admin/manage-organizations/manage-organizations.component').then(m => m.ManageOrganizationsComponent),
      },
      {
        path: 'admin/members',
        canActivate: [adminGuard],
        loadComponent: () => import('./pages/admin/manage-members/manage-members.component').then(m => m.ManageMembersComponent),
      },
    ],
  },
  { path: '**', redirectTo: '/dashboard' },
];
