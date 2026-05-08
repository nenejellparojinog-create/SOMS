import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OrganizationService } from '../../../services/organization.service';
import { MembershipService } from '../../../services/membership.service';

@Component({
  selector: 'app-manage-members',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="p-6 lg:p-8 max-w-7xl mx-auto">
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-1">
          <a routerLink="/admin" class="text-sm text-slate-400 hover:text-slate-600">Admin</a>
          <span class="text-slate-300">/</span>
          <span class="text-sm text-slate-700 font-medium">Members</span>
        </div>
        <h1 class="text-2xl font-bold text-slate-900">Manage Members</h1>
      </div>

      <!-- Filter Bar -->
      <div class="flex flex-wrap gap-3 mb-6">
        <select [(ngModel)]="selectedOrg" (ngModelChange)="loadMembers()" class="border border-stone-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-emerald-400">
          <option value="">All Organizations</option>
          @for (org of orgs(); track org.id) {
            <option [value]="org.id">{{ org.name }}</option>
          }
        </select>
        <div class="flex gap-1 bg-stone-100 p-1 rounded-xl">
          @for (tab of tabs; track tab.value) {
            <button (click)="activeTab.set(tab.value); loadMembers()"
              [class]="activeTab() === tab.value ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'"
              class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all">
              {{ tab.label }}
              @if (tab.value === 'pending' && pendingCount() > 0) {
                <span class="ml-1.5 bg-amber-400 text-white text-xs px-1.5 py-0.5 rounded-full">{{ pendingCount() }}</span>
              }
            </button>
          }
        </div>
      </div>

      @if (loading()) {
        <div class="space-y-3">
          @for (i of [1,2,3,4]; track i) {
            <div class="bg-white rounded-2xl border border-stone-200 p-4 animate-pulse h-16"></div>
          }
        </div>
      } @else if (members().length === 0) {
        <div class="bg-white rounded-2xl border border-stone-200 p-12 text-center">
          <svg class="w-10 h-10 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          <p class="text-slate-400 text-sm">No {{ activeTab() }} members found</p>
        </div>
      } @else {
        <div class="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-stone-50 text-left">
                  <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Member</th>
                  <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Organization</th>
                  <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                  <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined</th>
                  <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-stone-100">
                @for (m of members(); track m.id) {
                  <tr class="hover:bg-stone-50 transition-colors">
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span class="text-emerald-700 text-xs font-semibold">{{ m.users?.full_name?.charAt(0) }}</span>
                        </div>
                        <div>
                          <p class="font-medium text-slate-900">{{ m.users?.full_name }}</p>
                          <p class="text-xs text-slate-400">{{ m.users?.email }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-slate-600">{{ m.organizations?.name || '—' }}</td>
                    <td class="px-4 py-3">
                      <span class="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full capitalize">{{ m.role }}</span>
                    </td>
                    <td class="px-4 py-3">
                      <span [class]="statusClass(m.status)" class="text-xs font-medium px-2.5 py-1 rounded-full capitalize">{{ m.status }}</span>
                    </td>
                    <td class="px-4 py-3 text-slate-400 text-xs">{{ m.joined_at ? formatDate(m.joined_at) : '—' }}</td>
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-2">
                        @if (m.status === 'pending') {
                          <button (click)="updateStatus(m.id, 'approved')" class="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium px-2.5 py-1.5 rounded-lg transition-colors">Approve</button>
                          <button (click)="updateStatus(m.id, 'rejected')" class="text-xs bg-red-50 hover:bg-red-100 text-red-600 font-medium px-2.5 py-1.5 rounded-lg transition-colors">Reject</button>
                        }
                        @if (m.status === 'approved') {
                          <select (change)="updateRole(m.id, $event)" class="text-xs border border-stone-200 rounded-lg px-2 py-1 focus:outline-none">
                            <option value="member" [selected]="m.role === 'member'">Member</option>
                            <option value="officer" [selected]="m.role === 'officer'">Officer</option>
                            <option value="president" [selected]="m.role === 'president'">President</option>
                          </select>
                        }
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
})
export class ManageMembersComponent implements OnInit {
  private orgService = inject(OrganizationService);
  private membershipService = inject(MembershipService);

  orgs = signal<any[]>([]);
  members = signal<any[]>([]);
  loading = signal(true);
  activeTab = signal('pending');
  selectedOrg = '';
  pendingCount = signal(0);

  tabs = [
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
  ];

  ngOnInit() {
    this.orgService.getAll({ limit: 100 }).subscribe(r => {
      this.orgs.set(r.data || []);
      this.loadMembers();
    });
  }

  loadMembers() {
    this.loading.set(true);
    const orgsToQuery = this.selectedOrg
      ? [{ id: this.selectedOrg }]
      : this.orgs();

    if (orgsToQuery.length === 0) { this.loading.set(false); return; }

    let allMembers: any[] = [];
    let done = 0;

    orgsToQuery.forEach((org: any) => {
      this.orgService.getMembers(org.id, this.activeTab()).subscribe(r => {
        const orgData = this.orgs().find(o => o.id === org.id);
        allMembers = [...allMembers, ...(r.data || []).map((m: any) => ({ ...m, organizations: orgData }))];
        done++;
        if (done === orgsToQuery.length) {
          this.members.set(allMembers);
          if (this.activeTab() === 'pending') this.pendingCount.set(allMembers.length);
          this.loading.set(false);
        }
      });
    });
  }

  updateStatus(id: string, status: 'approved' | 'rejected') {
    this.membershipService.updateStatus(id, status).subscribe(() => {
      this.members.update(ms => ms.filter(m => m.id !== id));
      if (status === 'approved' && this.activeTab() === 'pending') {
        this.pendingCount.update(n => Math.max(0, n - 1));
      }
    });
  }

  updateRole(id: string, event: Event) {
    const role = (event.target as HTMLSelectElement).value as any;
    this.membershipService.updateRole(id, role).subscribe();
  }

  statusClass(s: string) {
    return { approved: 'bg-emerald-100 text-emerald-700', pending: 'bg-amber-100 text-amber-700', rejected: 'bg-red-100 text-red-700' }[s] || 'bg-slate-100 text-slate-600';
  }

  formatDate(d: string) { return new Date(d).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' }); }
}
