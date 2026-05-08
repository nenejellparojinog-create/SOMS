import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OrganizationService } from '../../../services/organization.service';

@Component({
  selector: 'app-manage-organizations',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="p-6 lg:p-8 max-w-7xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <div>
          <div class="flex items-center gap-3 mb-1">
            <a routerLink="/admin" class="text-sm text-slate-400 hover:text-slate-600">Admin</a>
            <span class="text-slate-300">/</span>
            <span class="text-sm text-slate-700 font-medium">Organizations</span>
          </div>
          <h1 class="text-2xl font-bold text-slate-900">Manage Organizations</h1>
        </div>
        <button (click)="showCreateModal.set(true)"
          class="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          New Organization
        </button>
      </div>

      @if (loading()) {
        <div class="space-y-3">
          @for (i of [1,2,3,4,5]; track i) {
            <div class="bg-white rounded-2xl border border-stone-200 p-4 animate-pulse h-16"></div>
          }
        </div>
      } @else {
        <div class="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <div class="p-4 border-b border-stone-100">
            <input [(ngModel)]="searchTerm" (ngModelChange)="loadOrgs()" type="text" placeholder="Search organizations..."
              class="w-full sm:w-72 border border-stone-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-400" />
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-stone-50 text-left">
                  <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Organization</th>
                  <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                  <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Created</th>
                  <th class="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-stone-100">
                @for (org of organizations(); track org.id) {
                  <tr class="hover:bg-stone-50 transition-colors">
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span class="text-emerald-700 font-bold text-xs">{{ org.name.charAt(0) }}</span>
                        </div>
                        <div>
                          <p class="font-medium text-slate-900">{{ org.name }}</p>
                          <p class="text-xs text-slate-400 truncate max-w-[200px]">{{ org.description }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-4 py-3">
                      <span class="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full capitalize">{{ org.category }}</span>
                    </td>
                    <td class="px-4 py-3">
                      <span [class]="org.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'"
                        class="text-xs font-medium px-2 py-1 rounded-full">
                        {{ org.is_active ? 'Active' : 'Inactive' }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-slate-400 text-xs">{{ formatDate(org.created_at) }}</td>
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-2">
                        <a [routerLink]="['/organizations', org.id]"
                          class="text-xs text-blue-600 hover:text-blue-700 font-medium">View</a>
                        <button (click)="openEdit(org)"
                          class="text-xs text-emerald-600 hover:text-emerald-700 font-medium">Edit</button>
                        <button (click)="toggleActive(org)"
                          class="text-xs font-medium"
                          [class]="org.is_active ? 'text-amber-600 hover:text-amber-700' : 'text-slate-500 hover:text-slate-700'">
                          {{ org.is_active ? 'Deactivate' : 'Activate' }}
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
            @if (organizations().length === 0) {
              <div class="p-8 text-center text-slate-400 text-sm">No organizations found</div>
            }
          </div>
        </div>
      }

      <!-- Create Modal -->
      @if (showCreateModal()) {
        <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 class="text-lg font-semibold text-slate-900 mb-5">Create Organization</h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">Name *</label>
                <input [(ngModel)]="formData.name" type="text" class="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">Category *</label>
                <select [(ngModel)]="formData.category" class="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400">
                  <option value="academic">Academic</option>
                  <option value="cultural">Cultural</option>
                  <option value="sports">Sports</option>
                  <option value="civic">Civic</option>
                  <option value="religious">Religious</option>
                  <option value="technical">Technical</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">Description *</label>
                <textarea [(ngModel)]="formData.description" rows="3" class="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400 resize-none"></textarea>
              </div>
            </div>
            <div class="flex gap-3 mt-6">
              <button (click)="closeModals()" class="flex-1 border border-stone-200 text-slate-700 rounded-xl py-2.5 text-sm hover:bg-stone-50">Cancel</button>
              <button (click)="saveOrg()" [disabled]="saving()" class="flex-1 bg-emerald-500 text-white rounded-xl py-2.5 text-sm hover:bg-emerald-600 disabled:opacity-60">
                {{ saving() ? 'Saving...' : 'Create' }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Edit Modal -->
      @if (showEditModal()) {
        <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 class="text-lg font-semibold text-slate-900 mb-5">Edit Organization</h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
                <input [(ngModel)]="formData.name" type="text" class="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                <select [(ngModel)]="formData.category" class="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400">
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
                <textarea [(ngModel)]="formData.description" rows="3" class="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400 resize-none"></textarea>
              </div>
            </div>
            <div class="flex gap-3 mt-6">
              <button (click)="closeModals()" class="flex-1 border border-stone-200 text-slate-700 rounded-xl py-2.5 text-sm hover:bg-stone-50">Cancel</button>
              <button (click)="updateOrg()" [disabled]="saving()" class="flex-1 bg-emerald-500 text-white rounded-xl py-2.5 text-sm hover:bg-emerald-600 disabled:opacity-60">
                {{ saving() ? 'Saving...' : 'Update' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class ManageOrganizationsComponent implements OnInit {
  private orgService = inject(OrganizationService);

  organizations = signal<any[]>([]);
  loading = signal(true);
  saving = signal(false);
  showCreateModal = signal(false);
  showEditModal = signal(false);
  editingId = signal('');
  searchTerm = '';
  formData = { name: '', category: 'academic', description: '' };

  ngOnInit() { this.loadOrgs(); }

  loadOrgs() {
    this.loading.set(true);
    this.orgService.getAll({ limit: 100, search: this.searchTerm }).subscribe({
      next: (res) => { this.organizations.set(res.data || []); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openEdit(org: any) {
    this.formData = { name: org.name, category: org.category, description: org.description };
    this.editingId.set(org.id);
    this.showEditModal.set(true);
  }

  saveOrg() {
    if (!this.formData.name || !this.formData.description) return;
    this.saving.set(true);
    this.orgService.create(this.formData).subscribe({
      next: () => { this.closeModals(); this.loadOrgs(); },
      error: () => this.saving.set(false),
    });
  }

  updateOrg() {
    this.saving.set(true);
    this.orgService.update(this.editingId(), this.formData).subscribe({
      next: () => { this.closeModals(); this.loadOrgs(); },
      error: () => this.saving.set(false),
    });
  }

  toggleActive(org: any) {
    this.orgService.update(org.id, { is_active: !org.is_active }).subscribe(() => this.loadOrgs());
  }

  closeModals() {
    this.showCreateModal.set(false);
    this.showEditModal.set(false);
    this.saving.set(false);
    this.formData = { name: '', category: 'academic', description: '' };
  }

  formatDate(d: string) { return new Date(d).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' }); }
}
