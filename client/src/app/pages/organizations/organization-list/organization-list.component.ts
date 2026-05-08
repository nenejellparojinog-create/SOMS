import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormControl, FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { OrganizationService } from '../../../services/organization.service';
import { MembershipService } from '../../../services/membership.service';
import { AuthService } from '../../../services/auth.service';
import { Organization } from '../../../models';

@Component({
  selector: 'app-organization-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule],
  template: `
    <div class="p-6 lg:p-8 max-w-7xl mx-auto">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">Organizations</h1>
          <p class="text-slate-500 mt-1">Browse and join student organizations</p>
        </div>
        @if (auth.isAdmin()) {
          <button (click)="showCreateModal.set(true)"
            class="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            New Organization
          </button>
        }
      </div>

      <!-- Search + Filter -->
      <div class="flex flex-col sm:flex-row gap-3 mb-6">
        <div class="relative flex-1">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input [formControl]="searchControl" type="text" placeholder="Search organizations..."
            class="w-full pl-9 pr-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 bg-white" />
        </div>
        <select [(ngModel)]="selectedCategory" (ngModelChange)="loadOrgs()" [ngModelOptions]="{standalone: true}"
          class="border border-stone-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-emerald-400">
          <option value="">All Categories</option>
          <option value="academic">Academic</option>
          <option value="cultural">Cultural</option>
          <option value="sports">Sports</option>
          <option value="civic">Civic</option>
          <option value="religious">Religious</option>
          <option value="technical">Technical</option>
        </select>
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (i of [1,2,3,4,5,6]; track i) {
            <div class="bg-white rounded-2xl border border-stone-200 p-5 animate-pulse">
              <div class="h-4 bg-stone-200 rounded w-3/4 mb-3"></div>
              <div class="h-3 bg-stone-200 rounded w-full mb-2"></div>
              <div class="h-3 bg-stone-200 rounded w-2/3"></div>
            </div>
          }
        </div>
      } @else if (organizations().length === 0) {
        <div class="text-center py-16">
          <svg class="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          <p class="text-slate-400 font-medium">No organizations found</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (org of organizations(); track org.id) {
            <div class="bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all overflow-hidden group">
              <!-- Banner -->
              <div class="h-24 bg-gradient-to-br from-emerald-400 to-teal-600 relative overflow-hidden">
                @if (org.banner_url) {
                  <img [src]="org.banner_url" class="w-full h-full object-cover" />
                }
                <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                <span class="absolute top-3 right-3 bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full capitalize">{{ org.category }}</span>
              </div>

              <div class="p-5">
                <div class="flex items-start gap-3 mb-3">
                  <div class="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0 -mt-8 border-2 border-white shadow-sm">
                    <span class="text-emerald-700 font-bold text-sm">{{ org.name.charAt(0) }}</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="font-semibold text-slate-900 leading-tight">{{ org.name }}</h3>
                  </div>
                </div>

                <p class="text-slate-500 text-sm line-clamp-2 mb-4">{{ org.description }}</p>

                <div class="flex items-center justify-between">
                  <a [routerLink]="['/organizations', org.id]"
                    class="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                    View details →
                  </a>
                  @if (!auth.isAdmin()) {
                    <button (click)="joinOrg(org.id)" [disabled]="joiningId() === org.id"
                      class="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
                      {{ joiningId() === org.id ? 'Joining...' : 'Join' }}
                    </button>
                  }
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Pagination -->
        @if (pagination()) {
          <div class="flex items-center justify-between mt-6">
            <p class="text-sm text-slate-500">
              Showing {{ organizations().length }} of {{ pagination()!.total }} organizations
            </p>
            <div class="flex gap-2">
              <button (click)="prevPage()" [disabled]="currentPage() === 1"
                class="px-3 py-1.5 text-sm border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed">
                ← Prev
              </button>
              <span class="px-3 py-1.5 text-sm bg-emerald-50 text-emerald-700 rounded-lg font-medium">
                {{ currentPage() }} / {{ pagination()!.totalPages }}
              </span>
              <button (click)="nextPage()" [disabled]="currentPage() >= pagination()!.totalPages"
                class="px-3 py-1.5 text-sm border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed">
                Next →
              </button>
            </div>
          </div>
        }
      }

      <!-- Create Modal -->
      @if (showCreateModal()) {
        <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 class="text-lg font-semibold text-slate-900 mb-5">Create Organization</h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
                <input [(ngModel)]="newOrg.name" type="text" class="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400" placeholder="Organization name" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                <select [(ngModel)]="newOrg.category" class="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400">
                  <option value="academic">Academic</option>
                  <option value="cultural">Cultural</option>
                  <option value="sports">Sports</option>
                  <option value="civic">Civic</option>
                  <option value="religious">Religious</option>
                  <option value="technical">Technical</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                <textarea [(ngModel)]="newOrg.description" rows="3" class="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400 resize-none" placeholder="Describe the organization..."></textarea>
              </div>
            </div>
            <div class="flex gap-3 mt-6">
              <button (click)="showCreateModal.set(false)" class="flex-1 border border-stone-200 text-slate-700 rounded-xl py-2.5 text-sm hover:bg-stone-50 transition-colors">Cancel</button>
              <button (click)="createOrg()" [disabled]="creating()" class="flex-1 bg-emerald-500 text-white rounded-xl py-2.5 text-sm hover:bg-emerald-600 disabled:opacity-60 transition-colors">
                {{ creating() ? 'Creating...' : 'Create' }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Toast -->
      @if (toast()) {
        <div class="fixed bottom-5 right-5 bg-slate-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl z-50">
          {{ toast() }}
        </div>
      }
    </div>
  `,
})
export class OrganizationListComponent implements OnInit {
  auth = inject(AuthService);
  private orgService = inject(OrganizationService);
  private membershipService = inject(MembershipService);

  organizations = signal<Organization[]>([]);
  loading = signal(true);
  joiningId = signal('');
  showCreateModal = signal(false);
  creating = signal(false);
  toast = signal('');
  currentPage = signal(1);
  pagination = signal<any>(null);
  searchControl = new FormControl('');
  selectedCategory = '';
  newOrg = { name: '', category: 'academic', description: '' };

  ngOnInit() {
    this.loadOrgs();
    this.searchControl.valueChanges.pipe(debounceTime(400), distinctUntilChanged()).subscribe(() => {
      this.currentPage.set(1);
      this.loadOrgs();
    });
  }

  loadOrgs() {
    this.loading.set(true);
    this.orgService.getAll({
      page: this.currentPage(),
      limit: 9,
      search: this.searchControl.value || '',
    }).subscribe({
      next: (res) => {
        this.organizations.set(res.data || []);
        this.pagination.set(res.pagination);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  joinOrg(orgId: string) {
    this.joiningId.set(orgId);
    this.membershipService.join(orgId).subscribe({
      next: () => { this.showToast('Join request sent! Awaiting approval.'); this.joiningId.set(''); },
      error: (err) => { this.showToast(err.error?.message || 'Could not join.'); this.joiningId.set(''); },
    });
  }

  createOrg() {
    if (!this.newOrg.name || !this.newOrg.description) return;
    this.creating.set(true);
    this.orgService.create(this.newOrg).subscribe({
      next: () => { this.showCreateModal.set(false); this.creating.set(false); this.loadOrgs(); this.newOrg = { name: '', category: 'academic', description: '' }; },
      error: () => this.creating.set(false),
    });
  }

  prevPage() { this.currentPage.update(p => p - 1); this.loadOrgs(); }
  nextPage() { this.currentPage.update(p => p + 1); this.loadOrgs(); }

  showToast(msg: string) {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(''), 3000);
  }
}
