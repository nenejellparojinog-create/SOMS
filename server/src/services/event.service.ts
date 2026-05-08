import { supabase } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';
import { PaginationQuery } from '../types';

export class EventService {
  async getAll(query: PaginationQuery & { organizationId?: string; upcoming?: boolean }) {
    const { page = 1, limit = 10, search = '', sortBy = 'event_date', sortOrder = 'asc', organizationId, upcoming } = query;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let q = supabase
      .from('events')
      .select('*, organizations(id, name)', { count: 'exact' })
      .eq('is_published', true)
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, to);

    if (search) q = q.ilike('title', `%${search}%`);
    if (organizationId) q = q.eq('organization_id', organizationId);
    if (upcoming) q = q.gte('event_date', new Date().toISOString());

    const { data, error, count } = await q;
    if (error) throw new AppError(error.message, 500);
    return { data, total: count || 0, page, limit };
  }

  async getById(id: string) {
    const { data, error } = await supabase
      .from('events')
      .select('*, organizations(id, name, logo_url), users!created_by(full_name)')
      .eq('id', id)
      .single();

    if (error || !data) throw new AppError('Event not found', 404);
    return data;
  }

  async create(payload: {
    organization_id: string; title: string; description: string;
    location: string; event_date: string; end_date?: string; created_by: string;
  }) {
    const { data, error } = await supabase.from('events').insert(payload).select().single();
    if (error) throw new AppError(error.message, 500);
    return data;
  }

  async update(id: string, updates: Partial<{
    title: string; description: string; location: string;
    event_date: string; end_date: string; image_url: string; is_published: boolean;
  }>) {
    const { data, error } = await supabase
      .from('events')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);
    return data;
  }

  async delete(id: string) {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) throw new AppError(error.message, 500);
  }
}
