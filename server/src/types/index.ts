import { Request, Response } from 'express';

export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'user';
  full_name: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
  query: Record<string, any>;
  params: Record<string, any>;
  body: Record<string, any>;
  headers: Record<string, any>;
  file?: any;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface Organization {
  id: string;
  name: string;
  description: string;
  category: string;
  logo_url?: string;
  banner_url?: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  member_count?: number;
}

export interface Membership {
  id: string;
  user_id: string;
  organization_id: string;
  status: 'pending' | 'approved' | 'rejected';
  role: 'member' | 'officer' | 'president';
  joined_at?: string;
  created_at: string;
}

export interface Event {
  id: string;
  organization_id: string;
  title: string;
  description: string;
  location: string;
  event_date: string;
  end_date?: string;
  image_url?: string;
  is_published: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  organization_id?: string;
  user_id: string;
  title: string;
  description?: string;
  file_url: string;
  file_name: string;
  file_size: number;
  file_type: string;
  document_type: 'requirement' | 'minutes' | 'report' | 'other';
  created_at: string;
}
