import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, RotateCcw, Trash2, ShieldAlert } from 'lucide-react';
import { fileService } from '../services/fileService';
import { FileIcon } from '../components/files/FileIcon';
import { EmptyState } from '../components/common/EmptyState';
import { formatBytes, formatDate } from '../utils/formatters';
import { useToast } from '../context/ToastContext';

export const TrashPage = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const { data: trashItems = [], isLoading } = useQuery({
    queryKey: ['trash'],
    queryFn: () => fileService.getTrashItems(),
  });

  const restoreMutation = useMutation({
    mutationFn: (trashId) => fileService.restoreFileFromTrash(trashId),
    onSuccess: (restoredFile) => {
      queryClient.invalidateQueries(['trash']);
      queryClient.invalidateQueries(['files']);
      addToast(`Restored "${restoredFile?.name || 'File'}" to My Drive`, 'success');
    },
  });

  const permanentDeleteMutation = useMutation({
    mutationFn: (trashId) => fileService.permanentDeleteFromTrash(trashId),
    onSuccess: () => {
      queryClient.invalidateQueries(['trash']);
      addToast('Item permanently deleted', 'info');
    },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-[#F5F7FA] tracking-tight">Trash</h1>
        <p className="text-xs text-[#6B7280] font-medium mt-0.5">
          View deleted files and restore items back to your cloud drive
        </p>
      </div>

      {/* Warning Notice Banner */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B]">
        <ShieldAlert className="w-5 h-5 shrink-0 text-[#F59E0B]" />
        <p className="text-xs font-semibold">
          Items in Trash are automatically deleted permanently after 30 days.
        </p>
      </div>

      <div className="bg-[#151821] border border-[#252936] rounded-2xl p-5 shadow-lg">
        {isLoading ? (
          <div className="py-8 text-center text-xs text-[#6B7280]">Loading trash items...</div>
        ) : trashItems.length > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#6B7280] border-b border-[#252936] mb-1">
              <span className="flex-1">Name</span>
              <span className="w-36 hidden sm:block">Original Location</span>
              <span className="w-28 hidden md:block">Deleted Date</span>
              <span className="w-24 text-right pr-4 hidden lg:block">Size</span>
              <span className="w-28 text-right">Actions</span>
            </div>

            {trashItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-xl bg-[#11141B] border border-[#252936] hover:border-[#252936]/80 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-xl bg-[#151821] border border-[#252936] flex items-center justify-center shrink-0">
                    <FileIcon fileName={item.name} className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-[#F5F7FA] truncate">{item.name}</span>
                </div>

                <div className="hidden sm:block w-36 text-xs text-[#9CA3AF] truncate">
                  {item.originalLocation || 'My Drive'}
                </div>

                <div className="hidden md:block w-28 text-xs text-[#6B7280]">
                  {formatDate(item.deletedAt)}
                </div>

                <div className="hidden lg:block w-24 text-right pr-4 text-xs text-[#6B7280]">
                  {formatBytes(item.size)}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 justify-end w-28">
                  <button
                    onClick={() => restoreMutation.mutate(item.id)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 text-xs font-bold hover:bg-[#22C55E]/25 transition-all"
                    title="Restore file"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Restore
                  </button>

                  <button
                    onClick={() => permanentDeleteMutation.mutate(item.id)}
                    className="p-1.5 text-[#6B7280] hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors"
                    title="Delete permanently"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            type="trash"
            title="Trash is Empty"
            description="Deleted files and folders will appear here until they are permanently removed."
          />
        )}
      </div>
    </div>
  );
};
