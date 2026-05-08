import { Response, NextFunction } from 'express';
import { OrganizationService } from '../services/organization.service';
import { AuthRequest } from '../types';

const orgService = new OrganizationService();

export const getOrganizations = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await orgService.getAll(req.query as any);
    const { data, total, page, limit } = result;
    res.json({
      success: true, message: 'Organizations retrieved', data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) { next(err); }
};

export const getOrganization = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const org = await orgService.getById(req.params.id);
    res.json({ success: true, message: 'Organization retrieved', data: org });
  } catch (err) { next(err); }
};

export const createOrganization = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const org = await orgService.create({ ...(req.body as any), created_by: req.user!.id });
    res.status(201).json({ success: true, message: 'Organization created', data: org });
  } catch (err) { next(err); }
};

export const updateOrganization = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const org = await orgService.update(req.params.id, req.body);
    res.json({ success: true, message: 'Organization updated', data: org });
  } catch (err) { next(err); }
};

export const deleteOrganization = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await orgService.delete(req.params.id);
    res.json({ success: true, message: 'Organization deleted' });
  } catch (err) { next(err); }
};

export const getOrganizationMembers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query as { status?: string };
    const members = await orgService.getMembers(req.params.id, status);
    res.json({ success: true, message: 'Members retrieved', data: members });
  } catch (err) { next(err); }
};

export const getOrganizationStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const stats = await orgService.getStats(req.params.id);
    res.json({ success: true, message: 'Stats retrieved', data: stats });
  } catch (err) { next(err); }
};
