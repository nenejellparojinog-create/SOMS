import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EventService } from '../../../services/event.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-3xl mx-auto p-6 lg:p-8">
      <a routerLink="/events" class="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        Back to Events
      </a>

      @if (loading()) {
        <div class="flex items-center justify-center py-20">
          <svg class="animate-spin w-6 h-6 text-violet-500" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
        </div>
      } @else if (event()) {
        <!-- Hero -->
        <div class="h-56 bg-gradient-to-br from-violet-400 to-purple-700 rounded-2xl mb-6 overflow-hidden relative">
          @if (event()!.image_url) { <img [src]="event()!.image_url" class="w-full h-full object-cover" /> }
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
            <div>
              <p class="text-violet-200 text-sm mb-1">{{ event()!.organizations?.name }}</p>
              <h1 class="text-2xl font-bold text-white">{{ event()!.title }}</h1>
            </div>
          </div>
        </div>

        <!-- Info cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div class="bg-white rounded-xl border border-stone-200 p-4 flex items-center gap-3">
            <div class="w-9 h-9 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            </div>
            <div>
              <p class="text-xs text-slate-400">Date</p>
              <p class="text-sm font-medium text-slate-900">{{ formatDate(event()!.event_date) }}</p>
            </div>
          </div>
          <div class="bg-white rounded-xl border border-stone-200 p-4 flex items-center gap-3">
            <div class="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            </div>
            <div>
              <p class="text-xs text-slate-400">Location</p>
              <p class="text-sm font-medium text-slate-900">{{ event()!.location }}</p>
            </div>
          </div>
          <div class="bg-white rounded-xl border border-stone-200 p-4 flex items-center gap-3">
            <div class="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <div>
              <p class="text-xs text-slate-400">Time</p>
              <p class="text-sm font-medium text-slate-900">{{ formatTime(event()!.event_date) }}</p>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div class="bg-white rounded-2xl border border-stone-200 p-6 mb-6">
          <h2 class="font-semibold text-slate-900 mb-3">About this Event</h2>
          <p class="text-slate-600 leading-relaxed text-sm whitespace-pre-line">{{ event()!.description }}</p>
        </div>

        <!-- Admin actions -->
        @if (auth.isAdmin()) {
          <div class="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p class="font-medium text-amber-900 text-sm">Admin Controls</p>
              <p class="text-amber-700 text-xs mt-0.5">Manage this event</p>
            </div>
            <div class="flex gap-2">
              <button (click)="togglePublish()" [disabled]="updating()"
                class="text-sm px-3 py-2 rounded-lg border border-amber-300 text-amber-700 hover:bg-amber-100 transition-colors disabled:opacity-50">
                {{ event()!.is_published ? 'Unpublish' : 'Publish' }}
              </button>
              <button (click)="deleteEvent()" [disabled]="deleting()"
                class="text-sm px-3 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50">
                {{ deleting() ? 'Deleting...' : 'Delete' }}
              </button>
            </div>
          </div>
        }
      }
    </div>
  `,
})
export class EventDetailComponent implements OnInit {
  auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private eventService = inject(EventService);

  event = signal<any>(null);
  loading = signal(true);
  updating = signal(false);
  deleting = signal(false);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.eventService.getById(id).subscribe({
      next: (res) => { this.event.set(res.data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  togglePublish() {
    this.updating.set(true);
    this.eventService.update(this.event()!.id, { is_published: !this.event()!.is_published }).subscribe({
      next: (res) => { this.event.set(res.data); this.updating.set(false); },
      error: () => this.updating.set(false),
    });
  }

  deleteEvent() {
    if (!confirm('Delete this event?')) return;
    this.deleting.set(true);
    this.eventService.delete(this.event()!.id).subscribe({ next: () => history.back() });
  }

  formatDate(d: string) { return new Date(d).toLocaleDateString('en', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }); }
  formatTime(d: string) { return new Date(d).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }); }
}
