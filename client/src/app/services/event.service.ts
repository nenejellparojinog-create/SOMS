import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Event, ApiResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly apiUrl = `${environment.apiUrl}/events`;

  constructor(private http: HttpClient) {}

  getAll(query: any = {}): Observable<any> {
    let params = new HttpParams();
    Object.entries(query).forEach(([k, v]) => { if (v !== undefined) params = params.set(k, String(v)); });
    return this.http.get<any>(this.apiUrl, { params });
  }

  getById(id: string): Observable<ApiResponse<Event>> {
    return this.http.get<ApiResponse<Event>>(`${this.apiUrl}/${id}`);
  }

  create(payload: Partial<Event>): Observable<ApiResponse<Event>> {
    return this.http.post<ApiResponse<Event>>(this.apiUrl, payload);
  }

  update(id: string, payload: Partial<Event>): Observable<ApiResponse<Event>> {
    return this.http.put<ApiResponse<Event>>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
