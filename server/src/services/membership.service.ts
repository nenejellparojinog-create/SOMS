import { supabase } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';

export class MembershipService {
  async join(userId: string, organizationId: string) {
    const { data: existing } = await supabase
      .from('memberships')
      .select('id, status')
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .single();

    if (existing) {
      if (existing.status === 'approved') throw new AppError('Already a member', 409);
      if (existing.status === 'pending') throw new AppError('Application already pending', 409);
      // Re-apply if rejected
      const { data, error } = await supabase
        .from('memberships')
        .update({ status: 'pending', created_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw new AppError(error.message, 500);
      return data;
    }

    const { data, error } = await supabase
      .from('memberships')
      .insert({ user_id: userId, organization_id: organizationId, status: 'pending', role: 'member' })
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);
    return data;
  }

  async leave(userId: string, organizationId: string) {
    const { error } = await supabase
      .from('memberships')
      .delete()
      .eq('user_id', userId)
      .eq('organization_id', organizationId);

    if (error) throw new AppError(error.message, 500);
  }

  async updateStatus(membershipId: string, status: 'approved' | 'rejected') {
    const updates: Record<string, string> = { status, updated_at: new Date().toISOString() };
    if (status === 'approved') updates.joined_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('memberships')
      .update(updates)
      .eq('id', membershipId)
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);
    return data;
  }

  async getUserMemberships(userId: string) {
    const { data, error } = await supabase
      .from('memberships')
      .select('*, organizations(id, name, description, category, logo_url)')
      .eq('user_id', userId);

    if (error) throw new AppError(error.message, 500);
    return data;
  }

  async updateRole(membershipId: string, role: 'member' | 'officer' | 'president') {
    const { data, error } = await supabase
      .from('memberships')
      .update({ role })
      .eq('id', membershipId)
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);
    return data;
  }
}
