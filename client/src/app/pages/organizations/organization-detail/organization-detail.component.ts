import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { OrganizationService } from '../../../services/organization.service';
import { MembershipService } from '../../../services/membership.service';
import { EventService } from '../../../services/event.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-organization-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-4xl mx-auto p-6 lg:p-8">
      @if (loading()) {
        <div class="flex items-center justify-center py-20">
          <svg class="animate-spin w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
        </div>
      } @else if (org()) {
        <!-- Banner -->
        <div class="h-48 bg-gradient-to-br from-emerald-400 to-teal-700 rounded-2xl mb-6 relative overflow-hidden">
          @if (org()!.banner_url) { <img [src]="org()!.banner_url" class="w-full h-full object-cover" /> }
          <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-6">
            <div>
              <span class="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full capitalize mb-2 inline-block">{{ org()!.category }}</span>
              <h1 class="text-3xl font-bold text-white">{{ org()!.name }}</h1>
            </div>
          </div>
          <a routerLink="/organizations" class="absolute top-4 left-4 bg-black/30 backdrop-blur-sm text-white text-sm px-3 py-1.5 rounded-lg hover:bg-black/50 transition-colors">
            ← Back
          </a>
        </div>

        <!-- Stats -->
        @if (stats()) {
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div class="bg-white rounded-xl border border-stone-200 p-4 text-center">
              <p class="text-2xl font-bold text-slate-900">{{ stats()!.totalMembers }}</p>
              <p class="text-xs text-slate-500 mt-1">Members</p>
            </div>
            <div class="bg-white rounded-xl border border-stone-200 p-4 text-center">
              <p class="text-2xl font-bold text-amber-500">{{ stats()!.pendingMembers }}</p>
              <p class="text-xs text-slate-500 mt-1">Pending</p>
            </div>
            <div class="bg-white rounded-xl border border-stone-200 p-4 text-center">
              <p class="text-2xl font-bold text-slate-900">{{ stats()!.totalEvents }}</p>
              <p class="text-xs text-slate-500 mt-1">Events</p>
            </div>
            <div class="bg-white rounded-xl border border-stone-200 p-4 text-center">
              <p class="text-2xl font-bold text-slate-900">{{ stats()!.totalDocuments }}</p>
              <p class="text-xs text-slate-500 mt-1">Documents</p>
            </div>
          </div>
        }

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Main content -->
          <div class="lg:col-span-2 space-y-5">
            <div class="bg-white rounded-2xl border border-stone-200 p-5">
              <h2 class="font-semibold text-slate-900 mb-3">About</h2>
              <p class="text-slate-600 text-sm leading-relaxed">{{ org()!.description }}</p>
            </div>

            <!-- Events -->
            @if (events().length > 0) {
              <div class="bg-white rounded-2xl border border-stone-200 p-5">
                <h2 class="font-semibold text-slate-900 mb-4">Upcoming Events</h2>
                <div class="space-y-3">
                  @for (event of events(); track event.id) {
                    <div class="flex gap-4 p-3 bg-stone-50 rounded-xl">
                      <div class="w-12 h-12 bg-violet-100 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                        <span class="text-violet-700 text-xs font-bold">{{ getDay(event.event_date) }}</span>
                        <span class="text-violet-500 text-xs">{{ getMonth(event.event_date) }}</span>
                      </div>
                      <div>
                        <p class="font-medium text-slate-900 text-sm">{{ event.title }}</p>
                        <p class="text-slate-400 text-xs mt-0.5">📍 {{ event.location }}</p>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }
          </div>

          <!-- Sidebar -->
          <div class="space-y-5">
            <!-- Join action -->
            @if (!auth.isAdmin()) {
              <div class="bg-white rounded-2xl border border-stone-200 p-5">
                <h3 class="font-semibold text-slate-900 mb-3">Membership</h3>
                <button (click)="joinOrg()" [disabled]="joining()"
                  class="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-medium py-2.5 rounded-xl text-sm transition-colors">
                  {{ joining() ? 'Submitting...' : 'Request to Join' }}
                </button>
                @if (joinMessage()) {
                  <p class="text-sm text-emerald-600 mt-2 text-center">{{ joinMessage() }}</p>
                }
              </div>
            }

            <!-- Members -->
            <div class="bg-white rounded-2xl border border-stone-200 p-5">
              <h3 class="font-semibold text-slate-900 mb-3">Members ({{ members().length }})</h3>
              <div class="space-y-2">
                @for (m of members().slice(0, 5); track m.id) {
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span class="text-emerald-700 text-xs font-semibold">{{ m.users?.full_name?.charAt(0) }}</span>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-slate-900">{{ m.users?.full_name }}</p>
                      <p class="text-xs text-slate-400 capitalize">{{ m.role }}</p>
                    </div>
                  </div>
                }
                @if (members().length > 5) {
                  <p class="text-xs text-slate-400 pt-1">+{{ members().length - 5 }} more members</p>
                }
              </div>
            </div>
          </div>
        </div>
      }

      @if (toast()) {
        <div class="fixed bottom-5 right-5 bg-slate-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl z-50">{{ toast() }}</div>
      }
    </div>
  `,
})
export class OrganizationDetailComponent implements OnInit {
  auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private orgService = inject(OrganizationService);
  private membershipService = inject(MembershipService);
  private eventService = inject(EventService);

  org = signal<any>(null);
  stats = signal<any>(null);
  members = signal<any[]>([]);
  events = signal<any[]>([]);
  loading = signal(true);
  joining = signal(false);
  joinMessage = signal('');
  toast = signal('');

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    forkJoin([
      this.orgService.getById(id),
      this.orgService.getStats(id),
      this.orgService.getMembers(id, 'approved'),
      this.eventService.getAll({ organizationId: id, upcoming: true }),
    ]).subscribe({
      next: ([org, stats, members, events]) => {
        this.org.set(org.data);
        this.stats.set(stats.data);
        this.members.set(members.data || []);
        this.events.set(events.data || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  joinOrg() {
    this.joining.set(true);
    this.membershipService.join(this.org()!.id).subscribe({
      next: () => { this.joinMessage.set('Request submitted! Awaiting approval.'); this.joining.set(false); },
      error: (err) => { this.joinMessage.set(err.error?.message || 'Error submitting request.'); this.joining.set(false); },
    });
  }

  getDay(date: string) { return new Date(date).getDate(); }
  getMonth(date: string) { return new Date(date).toLocaleDateString('en', { month: 'short' }); }
}
