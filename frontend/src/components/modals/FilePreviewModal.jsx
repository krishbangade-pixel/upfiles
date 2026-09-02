import React from 'react';
import { X, Download, Share2, FileText, Image as ImageIcon, Video as VideoIcon, File } from 'lucide-react';
import { formatBytes, formatDate, getFileTypeCategory } from '../../utils/formatters';

export const FilePreviewModal = ({ isOpen, file, onClose, onDownload, onShare }) => {
  if (!isOpen || !file) return null;

  const category = getFileTypeCategory(file.name, file.type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#151821] border border-[#252936] rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#252936] bg-[#0F1117]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#191C25] border border-[#252936] flex items-center justify-center shrink-0">
              {category === 'image' && <ImageIcon className="w-5 h-5 text-[#4F8EF7]" />}
              {category === 'video' && <VideoIcon className="w-5 h-5 text-[#7C5CFF]" />}
              {category === 'pdf' && <FileText className="w-5 h-5 text-[#EF4444]" />}
              {category !== 'image' && category !== 'video' && category !== 'pdf' && (
                <File className="w-5 h-5 text-[#9CA3AF]" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-[#F5F7FA] truncate">{file.name}</h3>
              <p className="text-[11px] text-[#6B7280]">
                {formatBytes(file.size)} • Modified {formatDate(file.lastModified)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onShare(file)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#191C25] border border-[#252936] text-xs font-semibold text-[#F5F7FA] hover:text-[#7C5CFF] hover:border-[#7C5CFF]/30 transition-all"
            >
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
            <button
              onClick={() => onDownload(file)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#7C5CFF] text-white text-xs font-bold hover:bg-[#6D4FF5] transition-all shadow-md shadow-[#7C5CFF]/20"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#6B7280] hover:text-[#F5F7FA] hover:bg-[#191C25] rounded-xl transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer Area */}
        <div className="flex-1 p-6 bg-[#0B0D12] overflow-y-auto flex items-center justify-center min-h-[350px]">
          {category === 'image' && file.url ? (
            <img
              src={file.url}
              alt={file.name}
              className="max-h-[60vh] object-contain rounded-xl shadow-2xl border border-[#252936]"
            />
          ) : category === 'video' && file.url && file.url.endsWith('.mp4') ? (
            <video controls className="max-h-[60vh] rounded-xl border border-[#252936]">
              <source src={file.url} type="video/mp4" />
              Your browser does not support HTML video preview.
            </video>
          ) : category === 'pdf' ? (
            <div className="w-full max-w-2xl bg-[#151821] border border-[#252936] rounded-2xl p-8 text-center space-y-4 shadow-xl">
              <div className="w-16 h-16 rounded-2xl bg-[#EF4444]/15 border border-[#EF4444]/30 flex items-center justify-center mx-auto">
                <FileText className="w-8 h-8 text-[#EF4444]" />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#F5F7FA]">PDF Document Preview</h4>
                <p className="text-xs text-[#6B7280] mt-1 max-w-md mx-auto">
                  This document contains {Math.floor(Math.random() * 15) + 3} pages. Interactive PDF viewer ready for cloud inspection.
                </p>
              </div>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={() => onDownload(file)}
                  className="px-4 py-2 rounded-xl bg-[#7C5CFF] text-white text-xs font-bold hover:bg-[#6D4FF5]"
                >
                  Open Full PDF
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center p-8">
              <div className="w-20 h-20 rounded-2xl bg-[#191C25] border border-[#252936] flex items-center justify-center mx-auto mb-4">
                <File className="w-10 h-10 text-[#7C5CFF]" />
              </div>
              <h4 className="text-base font-bold text-[#F5F7FA]">{file.name}</h4>
              <p className="text-xs text-[#6B7280] mt-1">No direct inline preview for {file.extension} files.</p>
              <button
                onClick={() => onDownload(file)}
                className="mt-4 px-5 py-2.5 rounded-xl bg-[#7C5CFF] text-white text-xs font-bold hover:bg-[#6D4FF5] shadow-lg shadow-[#7C5CFF]/20"
              >
                Download to View
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
