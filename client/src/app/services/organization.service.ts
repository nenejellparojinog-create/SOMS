import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Organization, ApiResponse, PagedResult } from '../models';

export interface OrgQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

@Injectable({ providedIn: 'root' })
export class OrganizationService {
  private readonly apiUrl = `${environment.apiUrl}/organizations`;

  constructor(private http: HttpClient) {}

  getAll(query: OrgQuery = {}): Observable<ApiResponse<Organization[]> & { pagination: any }> {
    let params = new HttpParams();
    Object.entries(query).forEach(([k, v]) => { if (v !== undefined) params = params.set(k, String(v)); });
    return this.http.get<any>(this.apiUrl, { params });
  }

  getById(id: string): Observable<ApiResponse<Organization>> {
    return this.http.get<ApiResponse<Organization>>(`${this.apiUrl}/${id}`);
  }

  create(payload: Partial<Organization>): Observable<ApiResponse<Organization>> {
    return this.http.post<ApiResponse<Organization>>(this.apiUrl, payload);
  }

  update(id: string, payload: Partial<Organization>): Observable<ApiResponse<Organization>> {
    return this.http.put<ApiResponse<Organization>>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  getMembers(id: string, status?: string): Observable<ApiResponse<any[]>> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/${id}/members`, { params });
  }

  getStats(id: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${id}/stats`);
  }
}
