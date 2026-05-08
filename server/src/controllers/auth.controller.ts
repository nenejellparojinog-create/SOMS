import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthRequest } from '../types';

const authService = new AuthService();

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, full_name, role } = req.body;
    const result = await authService.register(email, password, full_name, role);
    res.status(201).json({ success: true, message: 'Registration successful', data: result });
  } catch (err) { next(err); }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json({ success: true, message: 'Login successful', data: result });
  } catch (err) { next(err); }
};

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const profile = await authService.getProfile(req.user!.id);
    res.json({ success: true, message: 'Profile retrieved', data: profile });
  } catch (err) { next(err); }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const updated = await authService.updateProfile(req.user!.id, req.body);
    res.json({ success: true, message: 'Profile updated', data: updated });
  } catch (err) { next(err); }
};
