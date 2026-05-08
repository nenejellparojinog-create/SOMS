import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';
import { AuthUser } from '../types';

export class AuthService {
  async register(email: string, password: string, fullName: string, role: 'admin' | 'user' = 'user') {
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) throw new AppError('Email already registered', 409);

    const hashedPassword = await bcrypt.hash(password, 12);

    const { data: user, error } = await supabase
      .from('users')
      .insert({ email, password_hash: hashedPassword, full_name: fullName, role })
      .select('id, email, full_name, role, created_at')
      .single();

    if (error) throw new AppError(error.message, 500);

    const token = this.generateToken({ id: user.id, email: user.email, role: user.role, full_name: user.full_name });
    return { user, token };
  }

  async login(email: string, password: string) {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, full_name, role, password_hash, is_active')
      .eq('email', email)
      .single();

    if (error || !user) throw new AppError('Invalid credentials', 401);
    if (!user.is_active) throw new AppError('Account deactivated', 403);

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) throw new AppError('Invalid credentials', 401);

    const { password_hash, ...safeUser } = user;
    const token = this.generateToken({ id: user.id, email: user.email, role: user.role, full_name: user.full_name });
    return { user: safeUser, token };
  }

  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, full_name, role, avatar_url, created_at, is_active')
      .eq('id', userId)
      .single();

    if (error || !data) throw new AppError('User not found', 404);
    return data;
  }

  async updateProfile(userId: string, updates: { full_name?: string; avatar_url?: string }) {
    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select('id, email, full_name, role, avatar_url')
      .single();

    if (error) throw new AppError(error.message, 500);
    return data;
  }

  private generateToken(payload: AuthUser): string {
    return jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    } as jwt.SignOptions);
  }
}
