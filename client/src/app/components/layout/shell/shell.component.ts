import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="min-h-screen bg-stone-50 flex">
      <!-- Sidebar -->
      <aside [class]="sidebarOpen() ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
        class="fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transition-transform duration-300 lg:relative lg:flex lg:flex-col">
        
        <!-- Logo -->
        <div class="h-16 flex items-center px-6 border-b border-slate-700">
          <div class="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center mr-3">
            <span class="text-white font-bold text-sm">SO</span>
          </div>
          <span class="font-bold text-lg tracking-tight">SOMS</span>
        </div>

        <!-- Nav -->
        <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <p class="text-slate-400 text-xs font-semibold uppercase tracking-wider px-3 mb-3">Main</p>
          <a routerLink="/dashboard" routerLinkActive="bg-emerald-600 text-white"
            class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors text-sm">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"/></svg>
            Dashboard
          </a>
          <a routerLink="/organizations" routerLinkActive="bg-emerald-600 text-white"
            class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors text-sm">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            Organizations
          </a>
          <a routerLink="/events" routerLinkActive="bg-emerald-600 text-white"
            class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors text-sm">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            Events
          </a>
          <a routerLink="/documents" routerLinkActive="bg-emerald-600 text-white"
            class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors text-sm">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            Documents
          </a>

          @if (auth.isAdmin()) {
            <div class="pt-4">
              <p class="text-slate-400 text-xs font-semibold uppercase tracking-wider px-3 mb-3">Admin</p>
              <a routerLink="/admin" routerLinkActive="bg-emerald-600 text-white"
                class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors text-sm">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                Admin Panel
              </a>
              <a routerLink="/admin/organizations" routerLinkActive="bg-emerald-600 text-white"
                class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors text-sm">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                Manage Orgs
              </a>
              <a routerLink="/admin/members" routerLinkActive="bg-emerald-600 text-white"
                class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors text-sm">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                Manage Members
              </a>
            </div>
          }
        </nav>

        <!-- User -->
        <div class="border-t border-slate-700 p-4">
          <a routerLink="/profile" class="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div class="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span class="text-white text-sm font-semibold">{{ initial() }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-white text-sm font-medium truncate">{{ auth.currentUser()?.full_name }}</p>
              <p class="text-slate-400 text-xs truncate">{{ auth.currentUser()?.email }}</p>
            </div>
          </a>
          <button (click)="auth.logout()" class="mt-3 w-full text-left text-slate-400 text-xs hover:text-red-400 transition-colors">
            → Sign out
          </button>
        </div>
      </aside>

      <!-- Mobile overlay -->
      @if (sidebarOpen()) {
        <div class="fixed inset-0 bg-black/50 z-40 lg:hidden" (click)="sidebarOpen.set(false)"></div>
      }

      <!-- Main content -->
      <div class="flex-1 flex flex-col min-w-0">
        <!-- Topbar -->
        <header class="h-16 bg-white border-b border-stone-200 flex items-center px-4 lg:px-6 gap-4 sticky top-0 z-30">
          <button (click)="sidebarOpen.set(!sidebarOpen())" class="lg:hidden p-2 rounded-lg hover:bg-stone-100">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
          <div class="flex-1"></div>
          <span class="text-xs font-medium px-2 py-1 rounded-full"
            [class]="auth.isAdmin() ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'">
            {{ auth.currentUser()?.role | titlecase }}
          </span>
        </header>

        <!-- Page content -->
        <main class="flex-1 overflow-auto">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class ShellComponent {
  auth = inject(AuthService);
  sidebarOpen = signal(false);

  initial() {
    const name = this.auth.currentUser()?.full_name || 'U';
    return name.charAt(0).toUpperCase();
  }
}
