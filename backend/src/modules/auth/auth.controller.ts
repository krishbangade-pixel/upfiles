import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin, supabaseAnon } from '../../config/supabase.js';
import { AuthenticationError, ValidationError } from '../../utils/errors.js';
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(1, 'Full name is required'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, fullName } = req.body;

    const { data, error } = await supabaseAnon.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (error) {
      throw new ValidationError(error.message);
    }

    // Ensure profile row exists
    if (data.user) {
      await supabaseAdmin.from('profiles').upsert({
        id: data.user.id,
        email: data.user.email,
        full_name: fullName,
      });
    }

    res.status(201).json({
      data: {
        user: data.user,
        session: data.session,
      },
      message: 'User registered successfully',
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabaseAnon.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new AuthenticationError(error.message);
    }

    res.status(200).json({
      data: {
        user: data.user,
        session: data.session,
      },
      message: 'Sign in successful',
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      await supabaseAdmin.auth.admin.signOut(token);
    }

    res.status(200).json({
      data: null,
      message: 'Signed out successfully',
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user;
    if (!user) throw new AuthenticationError();

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    res.status(200).json({
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: profile?.full_name || user.user_metadata?.full_name || user.email.split('@')[0],
          avatarUrl: profile?.avatar_url || null,
          createdAt: profile?.created_at,
        },
      },
      message: 'Current user fetched',
    });
  } catch (err) {
    next(err);
  }
}
