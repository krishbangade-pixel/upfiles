import React from 'react';
import {
  FileText,
  FileSpreadsheet,
  Presentation,
  FileCode,
  FileArchive,
  Image as ImageIcon,
  Video,
  File,
  Layers,
  PenTool,
} from 'lucide-react';

const FigmaIcon = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`${className} text-purple-600`}
  >
    <path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z" />
    <path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z" />
    <path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z" />
    <path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z" />
    <path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z" />
  </svg>
);

export const FileIcon = ({ type, extension, className = 'w-5 h-5' }) => {
  const ext = (extension || type || '').toLowerCase();

  if (['pdf'].includes(ext)) {
    return <FileText className={`${className} text-red-500`} />;
  }

  if (['doc', 'docx'].includes(ext)) {
    return <FileText className={`${className} text-blue-600`} />;
  }

  if (['xls', 'xlsx', 'csv'].includes(ext)) {
    return <FileSpreadsheet className={`${className} text-emerald-600`} />;
  }

  if (['ppt', 'pptx'].includes(ext)) {
    return <Presentation className={`${className} text-orange-500`} />;
  }

  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) {
    return <ImageIcon className={`${className} text-purple-500`} />;
  }

  if (['mp4', 'mov', 'avi', 'mkv'].includes(ext)) {
    return <Video className={`${className} text-indigo-500`} />;
  }

  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return <FileArchive className={`${className} text-amber-600`} />;
  }

  if (['txt', 'md', 'json', 'js', 'jsx', 'ts', 'tsx'].includes(ext)) {
    return <FileCode className={`${className} text-gray-500`} />;
  }

  if (['figma', 'fig'].includes(ext)) {
    return <FigmaIcon className={className} />;
  }

  if (['psd'].includes(ext)) {
    return <Layers className={`${className} text-blue-700`} />;
  }

  return <File className={`${className} text-gray-400`} />;
};
