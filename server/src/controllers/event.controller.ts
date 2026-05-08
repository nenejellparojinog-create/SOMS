import { Response, NextFunction } from 'express';
import { EventService } from '../services/event.service';
import { AuthRequest } from '../types';

const eventService = new EventService();

export const getEvents = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await eventService.getAll(req.query as any);
    const { data, total, page, limit } = result;
    res.json({
      success: true, message: 'Events retrieved', data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) { next(err); }
};

export const getEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const event = await eventService.getById(req.params.id);
    res.json({ success: true, message: 'Event retrieved', data: event });
  } catch (err) { next(err); }
};

export const createEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const event = await eventService.create({ ...(req.body as any), created_by: req.user!.id });
    res.status(201).json({ success: true, message: 'Event created', data: event });
  } catch (err) { next(err); }
};

export const updateEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const event = await eventService.update(req.params.id, req.body);
    res.json({ success: true, message: 'Event updated', data: event });
  } catch (err) { next(err); }
};

export const deleteEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await eventService.delete(req.params.id);
    res.json({ success: true, message: 'Event deleted' });
  } catch (err) { next(err); }
};
