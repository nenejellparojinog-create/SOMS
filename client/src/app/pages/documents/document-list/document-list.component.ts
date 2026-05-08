import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentService } from '../../../services/document.service';
import { AuthService } from '../../../services/auth.service';
import { OrganizationService } from '../../../services/organization.service';

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 lg:p-8 max-w-7xl mx-auto">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">Documents</h1>
          <p class="text-slate-500 mt-1">Upload and manage your files</p>
        </div>
        <button (click)="showUploadModal.set(true)"
          class="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
          Upload File
        </button>
      </div>

      @if (loading()) {
        <div class="space-y-3">
          @for (i of [1,2,3,4]; track i) {
            <div class="bg-white rounded-2xl border border-stone-200 p-4 animate-pulse h-16"></div>
          }
        </div>
      } @else if (documents().length === 0) {
        <div class="text-center py-16 bg-white rounded-2xl border border-stone-200">
          <svg class="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          <p class="text-slate-400 font-medium">No documents yet</p>
          <p class="text-slate-300 text-sm mt-1">Upload your first file to get started</p>
        </div>
      } @else {
        <div class="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <div class="divide-y divide-stone-100">
            @for (doc of documents(); track doc.id) {
              <div class="p-4 flex items-center gap-4 hover:bg-stone-50 transition-colors">
                <!-- File icon -->
                <div [class]="fileIconClass(doc.file_type)" class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg">
                  {{ fileIcon(doc.file_type) }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-slate-900 text-sm truncate">{{ doc.title }}</p>
                  <div class="flex items-center gap-3 mt-0.5">
                    <span class="text-xs text-slate-400">{{ doc.file_name }}</span>
                    <span class="text-xs text-slate-300">•</span>
                    <span class="text-xs text-slate-400">{{ formatSize(doc.file_size) }}</span>
                    <span class="text-xs text-slate-300">•</span>
                    <span [class]="docTypeClass(doc.document_type)" class="text-xs font-medium px-2 py-0.5 rounded-full capitalize">{{ doc.document_type }}</span>
                  </div>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                  <p class="text-xs text-slate-400 hidden sm:block">{{ formatDate(doc.created_at) }}</p>
                  <a [href]="doc.file_url" target="_blank"
                    class="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Download">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                  </a>
                  <button (click)="deleteDoc(doc.id)"
                    class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Upload Modal -->
      @if (showUploadModal()) {
        <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 class="text-lg font-semibold text-slate-900 mb-5">Upload Document</h2>
            <div class="space-y-4">
              <!-- File drop zone -->
              <div class="border-2 border-dashed border-stone-300 rounded-xl p-6 text-center cursor-pointer hover:border-emerald-400 transition-colors"
                (click)="fileInput.click()" (dragover)="$event.preventDefault()" (drop)="onDrop($event)">
                @if (selectedFile()) {
                  <div class="flex items-center justify-center gap-3">
                    <span class="text-2xl">📄</span>
                    <div class="text-left">
                      <p class="text-sm font-medium text-slate-900 truncate max-w-[200px]">{{ selectedFile()!.name }}</p>
                      <p class="text-xs text-slate-400">{{ formatSize(selectedFile()!.size) }}</p>
                    </div>
                  </div>
                } @else {
                  <svg class="w-8 h-8 text-slate-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                  <p class="text-sm text-slate-500">Click or drag to upload</p>
                  <p class="text-xs text-slate-400 mt-1">PDF, Word, Excel, Images up to 10MB</p>
                }
                <input #fileInput type="file" class="hidden" (change)="onFileSelect($event)"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp" />
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">Title *</label>
                <input [(ngModel)]="uploadMeta.title" type="text" placeholder="Document title"
                  class="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">Type</label>
                <select [(ngModel)]="uploadMeta.document_type"
                  class="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400">
                  <option value="requirement">Requirement</option>
                  <option value="minutes">Minutes</option>
                  <option value="report">Report</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">Organization (optional)</label>
                <select [(ngModel)]="uploadMeta.organization_id"
                  class="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400">
                  <option value="">None</option>
                  @for (o of allOrgs(); track o.id) {
                    <option [value]="o.id">{{ o.name }}</option>
                  }
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">Description (optional)</label>
                <textarea [(ngModel)]="uploadMeta.description" rows="2"
                  class="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400 resize-none"></textarea>
              </div>
            </div>

            @if (uploadError()) {
              <p class="text-red-500 text-sm mt-3">{{ uploadError() }}</p>
            }

            <div class="flex gap-3 mt-6">
              <button (click)="closeUploadModal()" class="flex-1 border border-stone-200 text-slate-700 rounded-xl py-2.5 text-sm hover:bg-stone-50">Cancel</button>
              <button (click)="uploadFile()" [disabled]="uploading() || !selectedFile()"
                class="flex-1 bg-emerald-500 text-white rounded-xl py-2.5 text-sm hover:bg-emerald-600 disabled:opacity-60">
                @if (uploading()) {
                  <span class="inline-flex items-center gap-2">
                    <svg class="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    Uploading...
                  </span>
                } @else { Upload }
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class DocumentListComponent implements OnInit {
  auth = inject(AuthService);
  private docService = inject(DocumentService);
  private orgService = inject(OrganizationService);

  documents = signal<any[]>([]);
  allOrgs = signal<any[]>([]);
  loading = signal(true);
  showUploadModal = signal(false);
  uploading = signal(false);
  uploadError = signal('');
  selectedFile = signal<File | null>(null);
  uploadMeta = { title: '', document_type: 'requirement', organization_id: '', description: '' };

  ngOnInit() {
    this.loadDocs();
    this.orgService.getAll({ limit: 100 }).subscribe(r => this.allOrgs.set(r.data || []));
  }

  loadDocs() {
    this.loading.set(true);
    this.docService.getAll({ limit: 50 }).subscribe({
      next: (res) => { this.documents.set(res.data || []); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  onFileSelect(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.selectedFile.set(file);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) this.selectedFile.set(file);
  }

  uploadFile() {
    if (!this.selectedFile() || !this.uploadMeta.title) { this.uploadError.set('Please select a file and enter a title.'); return; }
    this.uploading.set(true);
    this.uploadError.set('');
    this.docService.upload(this.selectedFile()!, this.uploadMeta).subscribe({
      next: () => { this.closeUploadModal(); this.loadDocs(); },
      error: (err) => { this.uploadError.set(err.error?.message || 'Upload failed.'); this.uploading.set(false); },
    });
  }

  deleteDoc(id: string) {
    if (!confirm('Delete this document?')) return;
    this.docService.delete(id).subscribe({ next: () => this.loadDocs() });
  }

  closeUploadModal() {
    this.showUploadModal.set(false);
    this.uploading.set(false);
    this.selectedFile.set(null);
    this.uploadMeta = { title: '', document_type: 'requirement', organization_id: '', description: '' };
  }

  fileIcon(type: string) {
    if (type.includes('pdf')) return '📄';
    if (type.includes('word')) return '📝';
    if (type.includes('sheet') || type.includes('excel')) return '📊';
    if (type.includes('image')) return '🖼️';
    return '📁';
  }

  fileIconClass(type: string) {
    if (type.includes('pdf')) return 'bg-red-100';
    if (type.includes('word')) return 'bg-blue-100';
    if (type.includes('sheet') || type.includes('excel')) return 'bg-green-100';
    if (type.includes('image')) return 'bg-purple-100';
    return 'bg-slate-100';
  }

  docTypeClass(t: string) {
    return { requirement: 'bg-amber-100 text-amber-700', minutes: 'bg-blue-100 text-blue-700', report: 'bg-violet-100 text-violet-700', other: 'bg-stone-100 text-stone-600' }[t] || 'bg-stone-100 text-stone-600';
  }

  formatSize(bytes: number) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  formatDate(d: string) { return new Date(d).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' }); }
}
