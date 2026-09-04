import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../../config/supabase.js';
import { AuthenticationError, NotFoundError } from '../../utils/errors.js';
import { z } from 'zod';

export const updateProfileSchema = z.object({
  fullName: z.string().optional(),
  avatarUrl: z.string().url().optional().nullable(),
});

export async function getUserProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user;
    if (!user) throw new AuthenticationError();

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error || !profile) {
      throw new NotFoundError('User profile not found');
    }

    res.status(200).json({
      data: {
        id: profile.id,
        email: profile.email,
        name: profile.full_name,
        avatarUrl: profile.avatar_url,
        createdAt: profile.created_at,
      },
      message: 'Profile retrieved successfully',
    });
  } catch (err) {
    next(err);
  }
}

export async function updateUserProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user;
    if (!user) throw new AuthenticationError();

    const { fullName, avatarUrl } = req.body;
    const updates: Record<string, any> = { updated_at: new Date().toISOString() };

    if (fullName !== undefined) updates.full_name = fullName;
    if (avatarUrl !== undefined) updates.avatar_url = avatarUrl;

    const { data: updated, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    res.status(200).json({
      data: {
        id: updated.id,
        email: updated.email,
        name: updated.full_name,
        avatarUrl: updated.avatar_url,
        updatedAt: updated.updated_at,
      },
      message: 'Profile updated successfully',
    });
  } catch (err) {
    next(err);
  }
}
