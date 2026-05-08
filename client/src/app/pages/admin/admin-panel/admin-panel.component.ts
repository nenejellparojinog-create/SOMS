import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { OrganizationService } from '../../../services/organization.service';
import { EventService } from '../../../services/event.service';
import { MembershipService } from '../../../services/membership.service';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-6 lg:p-8 max-w-7xl mx-auto">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-slate-900">Admin Panel</h1>
        <p class="text-slate-500 mt-1">System overview and management</p>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
          <div class="flex items-center justify-between mb-3">
            <p class="text-sm text-slate-500">Total Organizations</p>
            <div class="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
              <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16"/></svg>
            </div>
          </div>
          <p class="text-3xl font-bold text-slate-900">{{ stats().totalOrgs }}</p>
          <a routerLink="/admin/organizations" class="text-xs text-emerald-600 mt-1 block hover:underline">Manage →</a>
        </div>
        <div class="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
          <div class="flex items-center justify-between mb-3">
            <p class="text-sm text-slate-500">Pending Approvals</p>
            <div class="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center">
              <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
          </div>
          <p class="text-3xl font-bold text-slate-900">{{ stats().pendingMembers }}</p>
          <a routerLink="/admin/members" class="text-xs text-amber-600 mt-1 block hover:underline">Review →</a>
        </div>
        <div class="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
          <div class="flex items-center justify-between mb-3">
            <p class="text-sm text-slate-500">Total Events</p>
            <div class="w-9 h-9 bg-violet-100 rounded-xl flex items-center justify-center">
              <svg class="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            </div>
          </div>
          <p class="text-3xl font-bold text-slate-900">{{ stats().totalEvents }}</p>
          <a routerLink="/events" class="text-xs text-violet-600 mt-1 block hover:underline">View all →</a>
        </div>
        <div class="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
          <div class="flex items-center justify-between mb-3">
            <p class="text-sm text-slate-500">Total Members</p>
            <div class="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            </div>
          </div>
          <p class="text-3xl font-bold text-slate-900">{{ stats().totalMembers }}</p>
          <a routerLink="/admin/members" class="text-xs text-blue-600 mt-1 block hover:underline">Manage →</a>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Recent Pending Members -->
        <div class="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <div class="p-5 border-b border-stone-100 flex items-center justify-between">
            <h2 class="font-semibold text-slate-900">Pending Approvals</h2>
            <a routerLink="/admin/members" class="text-sm text-emerald-600 hover:underline">View all</a>
          </div>
          @if (loading()) {
            <div class="p-6 text-center"><svg class="animate-spin w-5 h-5 text-slate-300 mx-auto" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg></div>
          } @else if (pendingMembers().length === 0) {
            <div class="p-6 text-center text-slate-400 text-sm">No pending approvals 🎉</div>
          } @else {
            <div class="divide-y divide-stone-100">
              @for (m of pendingMembers().slice(0, 5); track m.id) {
                <div class="p-4 flex items-center gap-3">
                  <div class="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span class="text-slate-600 text-sm font-semibold">{{ m.users?.full_name?.charAt(0) }}</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-slate-900 truncate">{{ m.users?.full_name }}</p>
                    <p class="text-xs text-slate-400 truncate">{{ m.organizations?.name }}</p>
                  </div>
                  <div class="flex gap-2 flex-shrink-0">
                    <button (click)="approveM(m.id)" class="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium px-2.5 py-1.5 rounded-lg transition-colors">Approve</button>
                    <button (click)="rejectM(m.id)" class="text-xs bg-red-50 hover:bg-red-100 text-red-600 font-medium px-2.5 py-1.5 rounded-lg transition-colors">Reject</button>
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- Quick Links -->
        <div class="bg-white rounded-2xl border border-stone-200 p-5">
          <h2 class="font-semibold text-slate-900 mb-4">Quick Actions</h2>
          <div class="grid grid-cols-2 gap-3">
            <a routerLink="/admin/organizations"
              class="flex flex-col items-center gap-2 p-4 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors text-center">
              <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16"/></svg>
              <span class="text-xs font-medium text-emerald-700">Manage Orgs</span>
            </a>
            <a routerLink="/admin/members"
              class="flex flex-col items-center gap-2 p-4 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors text-center">
              <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
              <span class="text-xs font-medium text-amber-700">Manage Members</span>
            </a>
            <a routerLink="/events"
              class="flex flex-col items-center gap-2 p-4 bg-violet-50 hover:bg-violet-100 rounded-xl transition-colors text-center">
              <svg class="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              <span class="text-xs font-medium text-violet-700">Events</span>
            </a>
            <a routerLink="/documents"
              class="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors text-center">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              <span class="text-xs font-medium text-blue-700">Documents</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AdminPanelComponent implements OnInit {
  private orgService = inject(OrganizationService);
  private eventService = inject(EventService);
  private membershipService = inject(MembershipService);

  loading = signal(true);
  pendingMembers = signal<any[]>([]);
  stats = signal({ totalOrgs: 0, pendingMembers: 0, totalEvents: 0, totalMembers: 0 });

  ngOnInit() {
    forkJoin([
      this.orgService.getAll({ limit: 1 }),
      this.eventService.getAll({ limit: 1 }),
    ]).subscribe(([orgs, events]) => {
      this.stats.update(s => ({ ...s, totalOrgs: orgs.pagination?.total || 0, totalEvents: events.pagination?.total || 0 }));
    });

    // Load all orgs to get pending members across all
    this.orgService.getAll({ limit: 100 }).subscribe(res => {
      const orgs = res.data || [];
      if (orgs.length === 0) { this.loading.set(false); return; }
      let allPending: any[] = [];
      let done = 0;
      orgs.forEach((org: any) => {
        this.orgService.getMembers(org.id, 'pending').subscribe(r => {
          allPending = [...allPending, ...(r.data || []).map((m: any) => ({ ...m, organizations: org }))];
          done++;
          if (done === orgs.length) {
            this.pendingMembers.set(allPending);
            this.stats.update(s => ({ ...s, pendingMembers: allPending.length }));
            this.loading.set(false);
          }
        });
      });
    });
  }

  approveM(id: string) {
    this.membershipService.updateStatus(id, 'approved').subscribe(() => {
      this.pendingMembers.update(ms => ms.filter(m => m.id !== id));
      this.stats.update(s => ({ ...s, pendingMembers: s.pendingMembers - 1, totalMembers: s.totalMembers + 1 }));
    });
  }

  rejectM(id: string) {
    this.membershipService.updateStatus(id, 'rejected').subscribe(() => {
      this.pendingMembers.update(ms => ms.filter(m => m.id !== id));
      this.stats.update(s => ({ ...s, pendingMembers: s.pendingMembers - 1 }));
    });
  }
}
