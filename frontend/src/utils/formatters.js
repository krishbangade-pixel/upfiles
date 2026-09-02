export const formatBytes = (bytes, decimals = 1) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

export const getFileTypeCategory = (fileName = '', type = '') => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext) || type.includes('image')) {
    return 'image';
  }
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext) || type.includes('video')) {
    return 'video';
  }
  if (['mp3', 'wav', 'ogg', 'flac'].includes(ext) || type.includes('audio')) {
    return 'audio';
  }
  if (['pdf'].includes(ext)) {
    return 'pdf';
  }
  if (['doc', 'docx', 'txt', 'rtf', 'odt'].includes(ext)) {
    return 'document';
  }
  if (['xls', 'xlsx', 'csv'].includes(ext)) {
    return 'spreadsheet';
  }
  if (['fig', 'ai', 'psd', 'sketch'].includes(ext)) {
    return 'design';
  }
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return 'archive';
  }
  return 'other';
};
