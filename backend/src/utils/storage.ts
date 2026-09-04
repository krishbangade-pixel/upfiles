import { supabaseAdmin } from '../config/supabase.js';
import { env } from '../config/env.js';
import { StorageError } from './errors.js';

export function getFileStoragePath(userId: string, fileId: string, version: number = 1): string {
  if (version === 1) {
    return `users/${userId}/files/${fileId}/original`;
  }
  return `users/${userId}/files/${fileId}/versions/${version}`;
}

export async function createSignedDownloadUrl(storagePath: string, expiresInSeconds: number = 300, client?: any): Promise<{ url: string; expiresIn: number }> {
  try {
    const db = client || supabaseAdmin;
    const { data, error } = await db.storage
      .from(env.SUPABASE_STORAGE_BUCKET)
      .createSignedUrl(storagePath, expiresInSeconds);

    if (error) {
      console.error('[createSignedDownloadUrl Error]', error);
    }

    if (error || !data?.signedUrl) {
      // Fallback: construct public URL or return empty string
      const { data: pubData } = db.storage
        .from(env.SUPABASE_STORAGE_BUCKET)
        .getPublicUrl(storagePath);
      
      const publicUrl = pubData?.publicUrl || '';
      return { url: publicUrl, expiresIn: expiresInSeconds };
    }

    return {
      url: data.signedUrl,
      expiresIn: expiresInSeconds,
    };
  } catch (err) {
    throw new StorageError('Failed to generate signed download URL');
  }
}
