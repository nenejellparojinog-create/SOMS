import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { OrganizationService } from '../../services/organization.service';
import { MembershipService } from '../../services/membership.service';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-6 lg:p-8 max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-slate-900">
          Good {{ greeting() }}, {{ getFirstName() }} 👋
        </h1>
        <p class="text-slate-500 mt-1">Here's what's happening in your organizations.</p>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm">
          <div class="flex items-center justify-between">
            <p class="text-sm text-slate-500">My Organizations</p>
            <div class="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
              <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            </div>
          </div>
          <p class="text-3xl font-bold text-slate-900 mt-3">{{ myOrgCount() }}</p>
          <p class="text-xs text-emerald-600 mt-1">{{ pendingCount() }} pending</p>
        </div>

        <div class="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm">
          <div class="flex items-center justify-between">
            <p class="text-sm text-slate-500">Total Organizations</p>
            <div class="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16"/></svg>
            </div>
          </div>
          <p class="text-3xl font-bold text-slate-900 mt-3">{{ totalOrgs() }}</p>
          <a routerLink="/organizations" class="text-xs text-blue-600 hover:underline mt-1 block">View all →</a>
        </div>

        <div class="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm">
          <div class="flex items-center justify-between">
            <p class="text-sm text-slate-500">Upcoming Events</p>
            <div class="w-9 h-9 bg-violet-100 rounded-xl flex items-center justify-center">
              <svg class="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            </div>
          </div>
          <p class="text-3xl font-bold text-slate-900 mt-3">{{ upcomingEvents() }}</p>
          <a routerLink="/events" class="text-xs text-violet-600 hover:underline mt-1 block">View all →</a>
        </div>

        <div class="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm">
          <div class="flex items-center justify-between">
            <p class="text-sm text-slate-500">Role</p>
            <div class="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center">
              <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            </div>
          </div>
          <p class="text-2xl font-bold text-slate-900 mt-3 capitalize">{{ auth.currentUser()?.role }}</p>
          @if (auth.isAdmin()) {
            <a routerLink="/admin" class="text-xs text-amber-600 hover:underline mt-1 block">Admin Panel →</a>
          }
        </div>
      </div>

      <!-- My Memberships -->
      <div class="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div class="p-5 border-b border-stone-100 flex items-center justify-between">
          <h2 class="font-semibold text-slate-900">My Organizations</h2>
          <a routerLink="/organizations" class="text-sm text-emerald-600 hover:underline">Browse all</a>
        </div>

        @if (loading()) {
          <div class="p-8 text-center">
            <svg class="animate-spin w-6 h-6 text-slate-400 mx-auto" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          </div>
        } @else if (memberships().length === 0) {
          <div class="p-8 text-center">
            <p class="text-slate-400 text-sm">You haven't joined any organizations yet.</p>
            <a routerLink="/organizations" class="inline-flex mt-3 bg-emerald-500 text-white text-sm px-4 py-2 rounded-xl hover:bg-emerald-600 transition-colors">
              Browse Organizations
            </a>
          </div>
        } @else {
          <div class="divide-y divide-stone-100">
            @for (m of memberships(); track m.id) {
              <div class="p-4 flex items-center gap-4">
                <div class="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span class="text-emerald-700 font-bold text-sm">{{ m.organizations?.name?.charAt(0) }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-slate-900 text-sm truncate">{{ m.organizations?.name }}</p>
                  <p class="text-slate-400 text-xs">{{ m.organizations?.category }}</p>
                </div>
                <span [class]="statusClass(m.status)" class="text-xs font-medium px-2.5 py-1 rounded-full">
                  {{ m.status | titlecase }}
                </span>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  auth = inject(AuthService);
  private orgService = inject(OrganizationService);
  private membershipService = inject(MembershipService);
  private eventService = inject(EventService);

  loading = signal(true);
  memberships = signal<any[]>([]);
  totalOrgs = signal(0);
  upcomingEvents = signal(0);

  myOrgCount = () => this.memberships().filter(m => m.status === 'approved').length;
  pendingCount = () => this.memberships().filter(m => m.status === 'pending').length;

  greeting() {
    const h = new Date().getHours();
    return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
  }

  getFirstName() {
    const fullName = this.auth.currentUser()?.full_name;
    return fullName ? fullName.split(' ')[0] : 'User';
  }

  statusClass(status: string) {
    return {
      approved: 'bg-emerald-100 text-emerald-700',
      pending: 'bg-amber-100 text-amber-700',
      rejected: 'bg-red-100 text-red-700',
    }[status] || 'bg-slate-100 text-slate-600';
  }

  ngOnInit() {
    forkJoin([
      this.membershipService.getMyMemberships(),
      this.orgService.getAll({ limit: 100 }),
      this.eventService.getAll({ upcoming: true, limit: 100 }),
    ]).subscribe({
      next: ([memberships, orgs, events]) => {
        this.memberships.set(memberships.data || []);
        this.totalOrgs.set(orgs.pagination?.total || 0);
        this.upcomingEvents.set(events.pagination?.total || 0);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
