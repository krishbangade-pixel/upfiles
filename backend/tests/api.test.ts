import { describe, it, expect } from 'vitest';
import { sanitizeFilename, getExtension, formatSizeBytes } from '../src/utils/filenames.js';
import { getFileStoragePath } from '../src/utils/storage.js';

describe('Backend Utility Tests', () => {
  it('sanitizes dangerous filenames correctly', () => {
    expect(sanitizeFilename('../../../etc/passwd')).toBe('passwd');
    expect(sanitizeFilename('my_document<script>.pdf')).toBe('my_document_script_.pdf');
  });

  it('extracts file extensions correctly', () => {
    expect(getExtension('report.final.pdf')).toBe('pdf');
    expect(getExtension('image.png')).toBe('png');
    expect(getExtension('noextension')).toBe('bin');
  });

  it('formats byte sizes cleanly', () => {
    expect(formatSizeBytes(0)).toBe('0 B');
    expect(formatSizeBytes(1024)).toBe('1.0 KB');
    expect(formatSizeBytes(2500000)).toBe('2.4 MB');
    expect(formatSizeBytes(1073741824)).toBe('1.0 GB');
  });

  it('generates secure user storage paths', () => {
    const path = getFileStoragePath('user-123', 'file-456', 1);
    expect(path).toBe('users/user-123/files/file-456/original');
  });

  it('generates versioned user storage paths', () => {
    const path = getFileStoragePath('user-123', 'file-456', 2);
    expect(path).toBe('users/user-123/files/file-456/versions/2');
  });
});
