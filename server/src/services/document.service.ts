import { supabase } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';
import { v4 as uuidv4 } from 'uuid';

export class DocumentService {
  async upload(file: any, metadata: {
    user_id: string; title: string; description?: string;
    organization_id?: string; document_type: string;
  }) {
    const ext = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${ext}`;
    const path = `documents/${metadata.user_id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('soms-files')
      .upload(path, file.buffer, { contentType: file.mimetype });

    if (uploadError) throw new AppError(uploadError.message, 500);

    const { data: { publicUrl } } = supabase.storage.from('soms-files').getPublicUrl(path);

    const { data, error } = await supabase
      .from('documents')
      .insert({
        ...metadata,
        file_url: publicUrl,
        file_name: file.originalname,
        file_size: file.size,
        file_type: file.mimetype,
      })
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);
    return data;
  }

  async getAll(query: { userId?: string; organizationId?: string; page?: number; limit?: number }) {
    const { userId, organizationId, page = 1, limit = 10 } = query;
    const from = (page - 1) * limit;

    let q = supabase
      .from('documents')
      .select('*, users(full_name)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1);

    if (userId) q = q.eq('user_id', userId);
    if (organizationId) q = q.eq('organization_id', organizationId);

    const { data, error, count } = await q;
    if (error) throw new AppError(error.message, 500);
    return { data, total: count || 0, page, limit };
  }

  async delete(id: string, userId: string, isAdmin: boolean) {
    const { data: doc } = await supabase.from('documents').select('user_id, file_url').eq('id', id).single();
    if (!doc) throw new AppError('Document not found', 404);
    if (!isAdmin && doc.user_id !== userId) throw new AppError('Unauthorized', 403);

    // Extract path from URL for storage deletion
    const urlParts = doc.file_url.split('/soms-files/');
    if (urlParts[1]) {
      await supabase.storage.from('soms-files').remove([urlParts[1]]);
    }

    const { error } = await supabase.from('documents').delete().eq('id', id);
    if (error) throw new AppError(error.message, 500);
  }
}
