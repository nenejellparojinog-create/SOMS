import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../../services/event.service';
import { AuthService } from '../../../services/auth.service';
import { OrganizationService } from '../../../services/organization.service';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="p-6 lg:p-8 max-w-7xl mx-auto">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">Events</h1>
          <p class="text-slate-500 mt-1">Upcoming events from all organizations</p>
        </div>
        @if (auth.isAdmin()) {
          <button (click)="showModal.set(true)"
            class="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            New Event
          </button>
        }
      </div>

      <!-- Filters -->
      <div class="flex gap-3 mb-6 flex-wrap">
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" [(ngModel)]="upcomingOnly" (change)="loadEvents()" class="rounded text-emerald-500" />
          <span class="text-sm text-slate-600">Upcoming only</span>
        </label>
        <div class="relative">
          <input [(ngModel)]="searchTerm" (ngModelChange)="loadEvents()" type="text" placeholder="Search events..."
            class="border border-stone-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-400 bg-white w-60" />
        </div>
      </div>

      @if (loading()) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (i of [1,2,3]; track i) {
            <div class="bg-white rounded-2xl border border-stone-200 p-5 animate-pulse h-48"></div>
          }
        </div>
      } @else if (events().length === 0) {
        <div class="text-center py-16">
          <svg class="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          <p class="text-slate-400 font-medium">No events found</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (event of events(); track event.id) {
            <div class="bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-md hover:border-violet-200 transition-all overflow-hidden">
              <div class="h-32 bg-gradient-to-br from-violet-400 to-purple-700 relative">
                @if (event.image_url) { <img [src]="event.image_url" class="w-full h-full object-cover" /> }
                <div class="absolute top-3 left-3 bg-white rounded-xl w-12 h-12 flex flex-col items-center justify-center shadow-sm">
                  <span class="text-slate-900 font-bold text-lg leading-none">{{ getDay(event.event_date) }}</span>
                  <span class="text-slate-500 text-xs">{{ getMonth(event.event_date) }}</span>
                </div>
              </div>
              <div class="p-4">
                <p class="text-xs text-slate-400 mb-1">{{ event.organizations?.name }}</p>
                <h3 class="font-semibold text-slate-900 mb-2 line-clamp-1">{{ event.title }}</h3>
                <p class="text-slate-500 text-xs line-clamp-2 mb-3">{{ event.description }}</p>
                <div class="flex items-center justify-between">
                  <span class="text-xs text-slate-400">📍 {{ event.location }}</span>
                  <a [routerLink]="['/events', event.id]" class="text-xs text-violet-600 font-medium hover:underline">Details →</a>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Pagination -->
        @if (pagination()) {
          <div class="flex items-center justify-between mt-6">
            <p class="text-sm text-slate-500">{{ events().length }} of {{ pagination()!.total }} events</p>
            <div class="flex gap-2">
              <button (click)="prevPage()" [disabled]="currentPage() === 1" class="px-3 py-1.5 text-sm border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-40">← Prev</button>
              <span class="px-3 py-1.5 text-sm bg-violet-50 text-violet-700 rounded-lg">{{ currentPage() }} / {{ pagination()!.totalPages }}</span>
              <button (click)="nextPage()" [disabled]="currentPage() >= pagination()!.totalPages" class="px-3 py-1.5 text-sm border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-40">Next →</button>
            </div>
          </div>
        }
      }

      <!-- Create Event Modal -->
      @if (showModal() && auth.isAdmin()) {
        <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 class="text-lg font-semibold text-slate-900 mb-5">Create Event</h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">Organization</label>
                <select [(ngModel)]="newEvent.organization_id" class="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400">
                  <option value="">Select organization</option>
                  @for (o of allOrgs(); track o.id) {
                    <option [value]="o.id">{{ o.name }}</option>
                  }
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
                <input [(ngModel)]="newEvent.title" type="text" class="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                <textarea [(ngModel)]="newEvent.description" rows="3" class="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400 resize-none"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">Location</label>
                <input [(ngModel)]="newEvent.location" type="text" class="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">Event Date</label>
                <input [(ngModel)]="newEvent.event_date" type="datetime-local" class="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400" />
              </div>
            </div>
            <div class="flex gap-3 mt-6">
              <button (click)="showModal.set(false)" class="flex-1 border border-stone-200 text-slate-700 rounded-xl py-2.5 text-sm hover:bg-stone-50">Cancel</button>
              <button (click)="createEvent()" [disabled]="creating()" class="flex-1 bg-emerald-500 text-white rounded-xl py-2.5 text-sm hover:bg-emerald-600 disabled:opacity-60">
                {{ creating() ? 'Creating...' : 'Create Event' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class EventListComponent implements OnInit {
  auth = inject(AuthService);
  private eventService = inject(EventService);
  private orgService = inject(OrganizationService);

  events = signal<any[]>([]);
  allOrgs = signal<any[]>([]);
  loading = signal(true);
  showModal = signal(false);
  creating = signal(false);
  pagination = signal<any>(null);
  currentPage = signal(1);
  searchTerm = '';
  upcomingOnly = true;
  newEvent = { organization_id: '', title: '', description: '', location: '', event_date: '' };

  ngOnInit() {
    this.loadEvents();
    if (this.auth.isAdmin()) {
      this.orgService.getAll({ limit: 100 }).subscribe(r => this.allOrgs.set(r.data || []));
    }
  }

  loadEvents() {
    this.loading.set(true);
    this.eventService.getAll({ page: this.currentPage(), limit: 9, search: this.searchTerm, upcoming: this.upcomingOnly || undefined }).subscribe({
      next: (res) => { this.events.set(res.data || []); this.pagination.set(res.pagination); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  createEvent() {
    this.creating.set(true);
    const payload = { ...this.newEvent, event_date: new Date(this.newEvent.event_date).toISOString() };
    this.eventService.create(payload).subscribe({
      next: () => { this.showModal.set(false); this.creating.set(false); this.loadEvents(); },
      error: () => this.creating.set(false),
    });
  }

  prevPage() { this.currentPage.update(p => p - 1); this.loadEvents(); }
  nextPage() { this.currentPage.update(p => p + 1); this.loadEvents(); }
  getDay(d: string) { return new Date(d).getDate(); }
  getMonth(d: string) { return new Date(d).toLocaleDateString('en', { month: 'short' }); }
}
