import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Document, ApiResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private readonly apiUrl = `${environment.apiUrl}/documents`;

  constructor(private http: HttpClient) {}

  upload(file: File, metadata: { title: string; description?: string; organization_id?: string; document_type?: string }): Observable<ApiResponse<Document>> {
    const formData = new FormData();
    formData.append('file', file);
    Object.entries(metadata).forEach(([k, v]) => { if (v) formData.append(k, v); });
    return this.http.post<ApiResponse<Document>>(this.apiUrl, formData);
  }

  getAll(query: any = {}): Observable<any> {
    let params = new HttpParams();
    Object.entries(query).forEach(([k, v]) => { if (v !== undefined) params = params.set(k, String(v)); });
    return this.http.get<any>(this.apiUrl, { params });
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
