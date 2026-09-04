import path from 'path';

export function sanitizeFilename(filename: string): string {
  // Prevent path traversal and remove dangerous control characters
  const basename = path.basename(filename);
  return basename.replace(/[^\w\s\.\-\(\)]/gi, '_').trim() || 'unnamed';
}

export function getExtension(filename: string): string {
  const parts = filename.split('.');
  if (parts.length < 2) return 'bin';
  return parts.pop()!.toLowerCase();
}

export function formatSizeBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
}
