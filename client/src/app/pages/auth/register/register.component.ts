import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <div class="inline-flex w-16 h-16 bg-emerald-500 rounded-2xl items-center justify-center mb-4 shadow-xl shadow-emerald-500/30">
            <span class="text-white font-bold text-2xl">SO</span>
          </div>
          <h1 class="text-3xl font-bold text-white">Create account</h1>
          <p class="text-slate-400 mt-2">Join the Student Organization Management System</p>
        </div>

        <div class="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
          @if (error()) {
            <div class="bg-red-500/20 border border-red-500/40 text-red-200 rounded-xl px-4 py-3 mb-6 text-sm">{{ error() }}</div>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-slate-200 mb-1.5">Full Name</label>
              <input type="text" formControlName="full_name"
                class="w-full bg-white/10 border border-white/20 text-white placeholder-slate-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors"
                placeholder="Juan dela Cruz" />
              @if (form.get('full_name')?.invalid && form.get('full_name')?.touched) {
                <p class="text-red-300 text-xs mt-1">Full name required</p>
              }
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-200 mb-1.5">Email address</label>
              <input type="email" formControlName="email"
                class="w-full bg-white/10 border border-white/20 text-white placeholder-slate-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors"
                placeholder="you@university.edu" />
              @if (form.get('email')?.invalid && form.get('email')?.touched) {
                <p class="text-red-300 text-xs mt-1">Valid email required</p>
              }
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-200 mb-1.5">Password</label>
              <input type="password" formControlName="password"
                class="w-full bg-white/10 border border-white/20 text-white placeholder-slate-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors"
                placeholder="Min. 6 characters" />
              @if (form.get('password')?.invalid && form.get('password')?.touched) {
                <p class="text-red-300 text-xs mt-1">Password must be at least 6 characters</p>
              }
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-200 mb-1.5">Role</label>
              <select formControlName="role"
                class="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors">
                <option value="user" class="text-slate-900">Student</option>
                <option value="admin" class="text-slate-900">Admin</option>
              </select>
            </div>

            <button type="submit" [disabled]="loading()"
              class="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 text-sm transition-colors shadow-lg shadow-emerald-500/30">
              @if (loading()) {
                <span class="inline-flex items-center gap-2">
                  <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Creating account...
                </span>
              } @else { Create account }
            </button>
          </form>
        </div>

        <p class="text-center text-slate-400 text-sm mt-6">
          Already have an account?
          <a routerLink="/auth/login" class="text-emerald-400 hover:text-emerald-300 font-medium ml-1">Sign in</a>
        </p>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  form = this.fb.group({
    full_name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['user'],
  });

  loading = signal(false);
  error = signal('');

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.loading.set(true);
    this.error.set('');

    this.auth.register(this.form.value as any).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.error.set(err.error?.message || 'Registration failed.');
        this.loading.set(false);
      },
    });
  }
}
