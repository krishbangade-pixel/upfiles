import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../../config/supabase.js';

export async function getActivities(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    const limit = parseInt(req.query.limit as string) || 50;

    const { data: activities, error } = await supabaseAdmin
      .from('activities')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);

    res.status(200).json({
      data: (activities || []).map((a: any) => ({
        id: a.id,
        action: a.action,
        resourceType: a.resource_type,
        resourceId: a.resource_id,
        context: a.context,
        createdAt: a.created_at,
      })),
      message: 'Activities fetched',
    });
  } catch (err) {
    next(err);
  }
}
