import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import { fileService } from '../services/fileService';
import { FileRow } from '../components/files/FileRow';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../context/ToastContext';

export const StarredPage = ({ onPreview, onDownload, onShare, onRename, onMove, onDelete }) => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const { data: starredFiles = [], isLoading } = useQuery({
    queryKey: ['starredFiles'],
    queryFn: () => fileService.getStarredFiles(),
  });

  const unstarMutation = useMutation({
    mutationFn: (file) => fileService.toggleStarFile(file.id),
    onSuccess: (updatedFile) => {
      queryClient.invalidateQueries(['starredFiles']);
      queryClient.invalidateQueries(['files']);
      addToast(`Removed "${updatedFile.name}" from favorites`, 'info');
    },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-[#F5F7FA] tracking-tight">Starred Files</h1>
        <p className="text-xs text-[#6B7280] font-medium mt-0.5">
          Quick access to your bookmarked files and favorite documents
        </p>
      </div>

      <div className="bg-[#151821] border border-[#252936] rounded-2xl p-5 shadow-lg">
        {isLoading ? (
          <div className="py-8 text-center text-xs text-[#6B7280]">Loading starred items...</div>
        ) : starredFiles.length > 0 ? (
          <div className="space-y-1">
            {starredFiles.map((file) => (
              <FileRow
                key={file.id}
                file={file}
                onPreview={onPreview}
                onDownload={onDownload}
                onShare={onShare}
                onRename={onRename}
                onMove={onMove}
                onStar={(f) => unstarMutation.mutate(f)}
                onDelete={onDelete}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            type="starred"
            title="No Starred Files"
            description="Star important files to quickly access them whenever you need."
          />
        )}
      </div>
    </div>
  );
};
