import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Eye, Download, Share2 } from 'lucide-react';
import { fileService } from '../services/fileService';
import { FileIcon } from '../components/files/FileIcon';
import { EmptyState } from '../components/common/EmptyState';
import { formatBytes, formatDate } from '../utils/formatters';
import { useToast } from '../context/ToastContext';

export const SharedPage = ({ onPreview, onShare }) => {
  const { addToast } = useToast();

  const { data: sharedFiles = [], isLoading } = useQuery({
    queryKey: ['sharedFiles'],
    queryFn: () => fileService.getSharedFiles(),
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-[#F5F7FA] tracking-tight">Shared With Me</h1>
        <p className="text-xs text-[#6B7280] font-medium mt-0.5">
          Files and folders shared with your account by team members
        </p>
      </div>

      <div className="bg-[#151821] border border-[#252936] rounded-2xl p-5 shadow-lg">
        {isLoading ? (
          <div className="py-8 text-center text-xs text-[#6B7280]">Loading shared items...</div>
        ) : sharedFiles.length > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#6B7280] border-b border-[#252936] mb-1">
              <span className="flex-1">Name</span>
              <span className="w-44 hidden sm:block">Owner</span>
              <span className="w-28 hidden md:block">Permission</span>
              <span className="w-28 text-right pr-4 hidden lg:block">Size</span>
              <span className="w-16"></span>
            </div>

            {sharedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-[#191C25] transition-all border border-transparent hover:border-[#252936]"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-xl bg-[#11141B] border border-[#252936] flex items-center justify-center shrink-0">
                    <FileIcon fileName={file.name} type={file.type} extension={file.extension} className="w-5 h-5" />
                  </div>
                  <span
                    onClick={() => onPreview(file)}
                    className="text-xs font-semibold text-[#F5F7FA] hover:text-[#7C5CFF] cursor-pointer truncate"
                  >
                    {file.name}
                  </span>
                </div>

                <div className="hidden sm:flex items-center gap-2 w-44">
                  <img
                    src={file.owner?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                    alt={file.owner?.name}
                    className="w-6 h-6 rounded-full object-cover border border-[#7C5CFF]/30"
                  />
                  <span className="text-xs font-medium text-[#9CA3AF] truncate">{file.owner?.name || 'Teammate'}</span>
                </div>

                <div className="hidden md:block w-28">
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#7C5CFF]/15 text-[#7C5CFF] border border-[#7C5CFF]/30">
                    Viewer
                  </span>
                </div>

                <div className="hidden lg:block w-28 text-right pr-4 text-xs text-[#6B7280]">
                  {formatBytes(file.size)}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onPreview(file)}
                    className="p-1.5 text-[#6B7280] hover:text-[#4F8EF7] rounded-lg transition-colors"
                    title="Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onShare(file)}
                    className="p-1.5 text-[#6B7280] hover:text-[#7C5CFF] rounded-lg transition-colors"
                    title="Share"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            type="shared"
            title="No Shared Files Yet"
            description="Items shared with you by other CloudVault users will show up here."
          />
        )}
      </div>
    </div>
  );
};
