import { Router } from 'express';
import { body } from 'express-validator';
import {
  joinOrganization, leaveOrganization, updateMembershipStatus,
  getUserMemberships, updateMemberRole
} from '../controllers/membership.controller';
import { authenticate, authorizeAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

/**
 * @swagger
 * /memberships/join:
 *   post:
 *     summary: Request to join an organization
 *     tags: [Memberships]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [organization_id]
 *             properties:
 *               organization_id: { type: string }
 *     responses:
 *       201: { description: Join request submitted }
 */
router.post('/join', authenticate, [
  body('organization_id').notEmpty().isUUID(),
  validate,
], joinOrganization);

router.delete('/leave/:organizationId', authenticate, leaveOrganization);
router.get('/my', authenticate, getUserMemberships);

/**
 * @swagger
 * /memberships/{id}/status:
 *   patch:
 *     summary: Approve or reject membership (Admin only)
 *     tags: [Memberships]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string, enum: [approved, rejected] }
 *     responses:
 *       200: { description: Status updated }
 */
router.patch('/:id/status', authenticate, authorizeAdmin, [
  body('status').isIn(['approved', 'rejected']),
  validate,
], updateMembershipStatus);

router.patch('/:id/role', authenticate, authorizeAdmin, [
  body('role').isIn(['member', 'officer', 'president']),
  validate,
], updateMemberRole);

export default router;
