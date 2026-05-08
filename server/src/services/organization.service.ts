import { supabase } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';
import { PaginationQuery } from '../types';

export class OrganizationService {
  async getAll(query: PaginationQuery) {
    const { page = 1, limit = 10, search = '', sortBy = 'created_at', sortOrder = 'desc' } = query;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let q = supabase
      .from('organizations')
      .select('*, users!created_by(full_name)', { count: 'exact' })
      .eq('is_active', true)
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, to);

    if (search) q = q.ilike('name', `%${search}%`);

    const { data, error, count } = await q;
    if (error) throw new AppError(error.message, 500);

    return { data, total: count || 0, page, limit };
  }

  async getById(id: string) {
    const { data, error } = await supabase
      .from('organizations')
      .select('*, users!created_by(full_name, email)')
      .eq('id', id)
      .single();

    if (error || !data) throw new AppError('Organization not found', 404);
    return data;
  }

  async create(payload: {
    name: string; description: string; category: string; created_by: string;
  }) {
    const { data, error } = await supabase
      .from('organizations')
      .insert(payload)
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);
    return data;
  }

  async update(id: string, updates: Partial<{ name: string; description: string; category: string; is_active: boolean; logo_url: string; banner_url: string }>) {
    const { data, error } = await supabase
      .from('organizations')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);
    return data;
  }

  async delete(id: string) {
    const { error } = await supabase.from('organizations').update({ is_active: false }).eq('id', id);
    if (error) throw new AppError(error.message, 500);
  }

  async getMembers(orgId: string, status?: string) {
    let q = supabase
      .from('memberships')
      .select('*, users(id, full_name, email, avatar_url)')
      .eq('organization_id', orgId);

    if (status) q = q.eq('status', status);

    const { data, error } = await q;
    if (error) throw new AppError(error.message, 500);
    return data;
  }

  async getStats(orgId: string) {
    const [members, events, docs] = await Promise.all([
      supabase.from('memberships').select('status').eq('organization_id', orgId),
      supabase.from('events').select('id').eq('organization_id', orgId),
      supabase.from('documents').select('id').eq('organization_id', orgId),
    ]);

    return {
      totalMembers: members.data?.filter(m => m.status === 'approved').length || 0,
      pendingMembers: members.data?.filter(m => m.status === 'pending').length || 0,
      totalEvents: events.data?.length || 0,
      totalDocuments: docs.data?.length || 0,
    };
  }
}
