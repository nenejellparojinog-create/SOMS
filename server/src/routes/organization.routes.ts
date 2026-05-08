import { Router } from 'express';
import { body } from 'express-validator';
import {
  getOrganizations, getOrganization, createOrganization,
  updateOrganization, deleteOrganization, getOrganizationMembers, getOrganizationStats
} from '../controllers/organization.controller';
import { authenticate, authorizeAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

/**
 * @swagger
 * /organizations:
 *   get:
 *     summary: Get all organizations (paginated)
 *     tags: [Organizations]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of organizations }
 */
router.get('/', authenticate, getOrganizations);

/**
 * @swagger
 * /organizations/{id}:
 *   get:
 *     summary: Get organization by ID
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Organization details }
 *       404: { description: Not found }
 */
router.get('/:id', authenticate, getOrganization);
router.get('/:id/members', authenticate, getOrganizationMembers);
router.get('/:id/stats', authenticate, getOrganizationStats);

/**
 * @swagger
 * /organizations:
 *   post:
 *     summary: Create a new organization (Admin only)
 *     tags: [Organizations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description, category]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               category: { type: string }
 *     responses:
 *       201: { description: Organization created }
 */
router.post('/', authenticate, authorizeAdmin, [
  body('name').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('category').trim().notEmpty(),
  validate,
], createOrganization);

router.put('/:id', authenticate, authorizeAdmin, updateOrganization);
router.delete('/:id', authenticate, authorizeAdmin, deleteOrganization);

export default router;
