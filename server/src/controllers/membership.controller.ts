import { Response, NextFunction } from 'express';
import { MembershipService } from '../services/membership.service';
import { AuthRequest } from '../types';

const membershipService = new MembershipService();

export const joinOrganization = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { organization_id } = req.body;
    const membership = await membershipService.join(req.user!.id, organization_id);
    res.status(201).json({ success: true, message: 'Join request submitted', data: membership });
  } catch (err) { next(err); }
};

export const leaveOrganization = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await membershipService.leave(req.user!.id, req.params.organizationId);
    res.json({ success: true, message: 'Left organization successfully' });
  } catch (err) { next(err); }
};

export const updateMembershipStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    const membership = await membershipService.updateStatus(req.params.id, status);
    res.json({ success: true, message: `Membership ${status}`, data: membership });
  } catch (err) { next(err); }
};

export const getUserMemberships = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const memberships = await membershipService.getUserMemberships(req.user!.id);
    res.json({ success: true, message: 'Memberships retrieved', data: memberships });
  } catch (err) { next(err); }
};

export const updateMemberRole = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { role } = req.body;
    const membership = await membershipService.updateRole(req.params.id, role);
    res.json({ success: true, message: 'Role updated', data: membership });
  } catch (err) { next(err); }
};
