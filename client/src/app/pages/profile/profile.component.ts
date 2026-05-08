import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { MembershipService } from '../../services/membership.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-2xl mx-auto p-6 lg:p-8">
      <h1 class="text-2xl font-bold text-slate-900 mb-8">My Profile</h1>

      <!-- Avatar + Info -->
      <div class="bg-white rounded-2xl border border-stone-200 p-6 mb-6">
        <div class="flex items-center gap-5 mb-6">
          <div class="w-20 h-20 bg-emerald-500 rounded-2xl flex items-center justify-center flex-shrink-0">
            <span class="text-white text-3xl font-bold">{{ initial() }}</span>
          </div>
          <div>
            <h2 class="text-xl font-semibold text-slate-900">{{ auth.currentUser()?.full_name }}</h2>
            <p class="text-slate-500 text-sm">{{ auth.currentUser()?.email }}</p>
            <span [class]="auth.isAdmin() ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'"
              class="inline-block text-xs font-medium px-2.5 py-1 rounded-full mt-2 capitalize">
              {{ auth.currentUser()?.role }}
            </span>
          </div>
        </div>

        @if (successMsg()) {
          <div class="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 mb-4 text-sm">{{ successMsg() }}</div>
        }
        @if (errorMsg()) {
          <div class="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-4 text-sm">{{ errorMsg() }}</div>
        }

        <form [formGroup]="form" (ngSubmit)="saveProfile()">
          <div class="mb-4">
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
            <input formControlName="full_name" type="text"
              class="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400" />
            @if (form.get('full_name')?.invalid && form.get('full_name')?.touched) {
              <p class="text-red-500 text-xs mt-1">Name is required</p>
            }
          </div>
          <div class="mb-5">
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
            <input [value]="auth.currentUser()?.email" type="email" disabled
              class="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm bg-stone-50 text-slate-400 cursor-not-allowed" />
          </div>
          <button type="submit" [disabled]="saving()"
            class="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition-colors">
            {{ saving() ? 'Saving...' : 'Save Changes' }}
          </button>
        </form>
      </div>

      <!-- My Memberships -->
      <div class="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <div class="p-5 border-b border-stone-100">
          <h3 class="font-semibold text-slate-900">My Organizations</h3>
        </div>
        @if (loadingMemberships()) {
          <div class="p-6 text-center">
            <svg class="animate-spin w-5 h-5 text-slate-400 mx-auto" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          </div>
        } @else if (memberships().length === 0) {
          <div class="p-6 text-center text-slate-400 text-sm">No organization memberships yet.</div>
        } @else {
          <div class="divide-y divide-stone-100">
            @for (m of memberships(); track m.id) {
              <div class="p-4 flex items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span class="text-emerald-700 font-bold text-sm">{{ m.organizations?.name?.charAt(0) }}</span>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-slate-900">{{ m.organizations?.name }}</p>
                    <p class="text-xs text-slate-400 capitalize">{{ m.role }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <span [class]="statusClass(m.status)" class="text-xs font-medium px-2.5 py-1 rounded-full capitalize">{{ m.status }}</span>
                  @if (m.status === 'approved') {
                    <button (click)="leaveOrg(m.organization_id)"
                      class="text-xs text-red-400 hover:text-red-600 transition-colors">Leave</button>
                  }
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class ProfileComponent implements OnInit {
  auth = inject(AuthService);
  private membershipService = inject(MembershipService);
  private fb = inject(FormBuilder);

  memberships = signal<any[]>([]);
  loadingMemberships = signal(true);
  saving = signal(false);
  successMsg = signal('');
  errorMsg = signal('');

  form = this.fb.group({
    full_name: [this.auth.currentUser()?.full_name || '', Validators.required],
  });

  initial() { return (this.auth.currentUser()?.full_name || 'U').charAt(0).toUpperCase(); }

  ngOnInit() {
    this.membershipService.getMyMemberships().subscribe({
      next: (res) => { this.memberships.set(res.data || []); this.loadingMemberships.set(false); },
      error: () => this.loadingMemberships.set(false),
    });
  }

  saveProfile() {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.successMsg.set('');
    this.errorMsg.set('');
    this.auth.updateProfile(this.form.value as any).subscribe({
      next: () => { this.successMsg.set('Profile updated successfully!'); this.saving.set(false); },
      error: (err) => { this.errorMsg.set(err.error?.message || 'Update failed.'); this.saving.set(false); },
    });
  }

  leaveOrg(orgId: string) {
    if (!confirm('Leave this organization?')) return;
    this.membershipService.leave(orgId).subscribe({
      next: () => this.memberships.update(ms => ms.filter(m => m.organization_id !== orgId)),
    });
  }

  statusClass(s: string) {
    return { approved: 'bg-emerald-100 text-emerald-700', pending: 'bg-amber-100 text-amber-700', rejected: 'bg-red-100 text-red-700' }[s] || '';
  }
}
