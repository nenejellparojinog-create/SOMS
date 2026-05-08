import { Response, NextFunction } from 'express';
import { DocumentService } from '../services/document.service';
import { AuthRequest } from '../types';
import { AppError } from '../middleware/errorHandler';

const documentService = new DocumentService();

export const uploadDocument = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) throw new AppError('No file uploaded', 400);
    const doc = await documentService.upload(req.file, {
      user_id: req.user!.id,
      title: req.body.title,
      description: req.body.description,
      organization_id: req.body.organization_id,
      document_type: req.body.document_type || 'other',
    });
    res.status(201).json({ success: true, message: 'Document uploaded', data: doc });
  } catch (err) { next(err); }
};

export const getDocuments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const isAdmin = req.user!.role === 'admin';
    const query: any = { page: req.query.page, limit: req.query.limit };

    if (!isAdmin) query.userId = req.user!.id;
    if (req.query.organization_id) query.organizationId = req.query.organization_id;

    const result = await documentService.getAll(query);
    const { data, total, page, limit } = result;
    res.json({
      success: true, message: 'Documents retrieved', data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) { next(err); }
};

export const deleteDocument = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await documentService.delete(req.params.id, req.user!.id, req.user!.role === 'admin');
    res.json({ success: true, message: 'Document deleted' });
  } catch (err) { next(err); }
};
