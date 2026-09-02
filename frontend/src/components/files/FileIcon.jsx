import React from 'react';
import {
  FileText,
  Image,
  Video,
  Music,
  FileCode,
  Archive,
  FileSpreadsheet,
  File
} from 'lucide-react';
import { getFileTypeCategory } from '../../utils/formatters';

const FigmaIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 38 57" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5C38 33.7467 33.7467 38 28.5 38H19V28.5Z" fill="#1ABCFE"/>
    <path d="M0 47.5C0 42.2533 4.25329 38 9.5 38H19V47.5C19 52.7467 14.7467 57 9.5 57C4.25329 57 0 52.7467 0 47.5Z" fill="#0ACF83"/>
    <path d="M19 0V19H28.5C33.7467 19 38 14.7467 38 9.5C38 4.25329 33.7467 0 28.5 0H19Z" fill="#FF7262"/>
    <path d="M0 9.5C0 14.7467 4.25329 19 9.5 19H19V0H9.5C4.25329 0 0 4.25329 0 9.5Z" fill="#F24E1E"/>
    <path d="M0 28.5C0 33.7467 4.25329 38 9.5 38H19V19H9.5C4.25329 19 0 23.2533 0 28.5Z" fill="#A259FF"/>
  </svg>
);

export const FileIcon = ({ fileName = '', type = '', extension = '', className = 'w-5 h-5' }) => {
  const cat = getFileTypeCategory(fileName, type);
  const ext = (extension || fileName.split('.').pop() || '').toLowerCase();

  if (ext === 'fig') {
    return <FigmaIcon className={className} />;
  }

  switch (cat) {
    case 'image':
      return <Image className={`${className} text-[#4F8EF7]`} />;
    case 'video':
      return <Video className={`${className} text-[#7C5CFF]`} />;
    case 'audio':
      return <Music className={`${className} text-[#F59E0B]`} />;
    case 'pdf':
      return <FileText className={`${className} text-[#EF4444]`} />;
    case 'document':
      return <FileText className={`${className} text-[#4F8EF7]`} />;
    case 'spreadsheet':
      return <FileSpreadsheet className={`${className} text-[#22C55E]`} />;
    case 'design':
      return <FileCode className={`${className} text-[#EC4899]`} />;
    case 'archive':
      return <Archive className={`${className} text-[#F59E0B]`} />;
    default:
      return <File className={`${className} text-[#9CA3AF]`} />;
  }
};
