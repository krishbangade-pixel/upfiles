import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock } from 'lucide-react';
import { fileService } from '../services/fileService';
import { FileRow } from '../components/files/FileRow';
import { EmptyState } from '../components/common/EmptyState';

export const RecentPage = ({ onPreview, onDownload, onShare, onRename, onMove, onStar, onDelete }) => {
  const { data: recentFiles = [], isLoading } = useQuery({
    queryKey: ['recentFiles'],
    queryFn: () => fileService.getRecentFiles(20),
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-[#F5F7FA] tracking-tight">Recent Files</h1>
        <p className="text-xs text-[#6B7280] font-medium mt-0.5">
          Timeline of all recently created, edited, or uploaded documents
        </p>
      </div>

      <div className="bg-[#151821] border border-[#252936] rounded-2xl p-5 shadow-lg">
        {isLoading ? (
          <div className="py-8 text-center text-xs text-[#6B7280]">Loading recent activity...</div>
        ) : recentFiles.length > 0 ? (
          <div className="space-y-1">
            {recentFiles.map((file) => (
              <FileRow
                key={file.id}
                file={file}
                onPreview={onPreview}
                onDownload={onDownload}
                onShare={onShare}
                onRename={onRename}
                onMove={onMove}
                onStar={onStar}
                onDelete={onDelete}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            type="folder"
            title="No Recent Activity"
            description="Your recent file interactions will show up here."
          />
        )}
      </div>
    </div>
  );
};
