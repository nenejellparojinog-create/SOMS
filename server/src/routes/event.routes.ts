import { Router } from 'express';
import { body } from 'express-validator';
import { getEvents, getEvent, createEvent, updateEvent, deleteEvent } from '../controllers/event.controller';
import { authenticate, authorizeAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Get all events (paginated, filterable)
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: organizationId
 *         schema: { type: string }
 *       - in: query
 *         name: upcoming
 *         schema: { type: boolean }
 *     responses:
 *       200: { description: List of events }
 */
router.get('/', authenticate, getEvents);
router.get('/:id', authenticate, getEvent);

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Create a new event (Admin only)
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [organization_id, title, description, location, event_date]
 *             properties:
 *               organization_id: { type: string }
 *               title: { type: string }
 *               description: { type: string }
 *               location: { type: string }
 *               event_date: { type: string, format: date-time }
 *               end_date: { type: string, format: date-time }
 *     responses:
 *       201: { description: Event created }
 */
router.post('/', authenticate, authorizeAdmin, [
  body('organization_id').notEmpty().isUUID(),
  body('title').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('location').trim().notEmpty(),
  body('event_date').isISO8601(),
  validate,
], createEvent);

router.put('/:id', authenticate, authorizeAdmin, updateEvent);
router.delete('/:id', authenticate, authorizeAdmin, deleteEvent);

export default router;
