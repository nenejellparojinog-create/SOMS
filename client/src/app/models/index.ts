export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'user';
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
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
  organizations?: Organization;
  users?: User;
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
  organizations?: Organization;
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
  users?: User;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PagedResult<T> {
  data: T[];
  pagination: Pagination;
}
