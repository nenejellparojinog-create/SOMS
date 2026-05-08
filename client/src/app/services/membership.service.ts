import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Membership, ApiResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class MembershipService {
  private readonly apiUrl = `${environment.apiUrl}/memberships`;

  constructor(private http: HttpClient) {}

  join(organizationId: string): Observable<ApiResponse<Membership>> {
    return this.http.post<ApiResponse<Membership>>(`${this.apiUrl}/join`, { organization_id: organizationId });
  }

  leave(organizationId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/leave/${organizationId}`);
  }

  getMyMemberships(): Observable<ApiResponse<Membership[]>> {
    return this.http.get<ApiResponse<Membership[]>>(`${this.apiUrl}/my`);
  }

  updateStatus(id: string, status: 'approved' | 'rejected'): Observable<ApiResponse<Membership>> {
    return this.http.patch<ApiResponse<Membership>>(`${this.apiUrl}/${id}/status`, { status });
  }

  updateRole(id: string, role: string): Observable<ApiResponse<Membership>> {
    return this.http.patch<ApiResponse<Membership>>(`${this.apiUrl}/${id}/role`, { role });
  }
}
