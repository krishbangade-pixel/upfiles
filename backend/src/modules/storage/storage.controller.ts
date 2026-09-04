import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../../config/supabase.js';

const TOTAL_STORAGE_BYTES = 15 * 1024 * 1024 * 1024; // 15 GB = 16106127360 bytes

export async function getStorageUsage(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user!;
    if (!user || !user.id) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    const db = req.db || supabaseAdmin;

    // Query size_bytes for active (non-deleted, ready) files owned by user
    const { data: files, error } = await db
      .from('files')
      .select('size_bytes, status, is_deleted')
      .eq('owner_id', user.id)
      .eq('is_deleted', false);

    if (error) {
      console.error('[Storage Usage Error]', error);
      throw new Error(error.message);
    }

    // Filter files with status = 'ready' (or not failed) and sum size_bytes
    const activeFiles = (files || []).filter((f: any) => f.status === 'ready' || f.status !== 'failed');
    const usedBytes = activeFiles.reduce((sum: number, f: any) => sum + (Number(f.size_bytes) || 0), 0);

    const percentage = TOTAL_STORAGE_BYTES > 0 ? Number(((usedBytes / TOTAL_STORAGE_BYTES) * 100).toFixed(4)) : 0;

    return res.status(200).json({
      data: {
        usedBytes,
        totalBytes: TOTAL_STORAGE_BYTES,
        percentage,
        formattedUsed: `${(usedBytes / (1024 * 1024 * 1024)).toFixed(1)} GB`,
        formattedTotal: `${(TOTAL_STORAGE_BYTES / (1024 * 1024 * 1024)).toFixed(1)} GB`,
      },
      message: 'Storage usage retrieved',
    });
  } catch (err) {
    console.error('[Storage Usage Controller Error]', err);
    next(err);
  }
}

