import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Upload as UploadIcon, FolderPlus, ArrowUpDown } from 'lucide-react';
import { folderService } from '../services/folderService';
import { fileService } from '../services/fileService';
import { FolderCard } from '../components/folders/FolderCard';
import { FileRow } from '../components/files/FileRow';
import { FileCard } from '../components/files/FileCard';
import { Breadcrumbs } from '../components/folders/Breadcrumbs';
import { GridListToggle } from '../components/files/GridListToggle';
import { StorageCard } from '../components/dashboard/StorageCard';
import { ActivityChart } from '../components/dashboard/ActivityChart';
import { EmptyState } from '../components/common/EmptyState';
import { SkeletonFolderCard, SkeletonFileRow } from '../components/common/Skeleton';
import { useToast } from '../context/ToastContext';
import { getStoredItem, setStoredItem, STORAGE_KEYS } from '../utils/storage';

export const DrivePage = ({
  onOpenUpload,
  onOpenNewFolder,
  onShare,
  onRename,
  onMove,
  onDelete,
  onPreview,
  searchQuery,
}) => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [viewMode, setViewMode] = useState(() => getStoredItem(STORAGE_KEYS.VIEW_MODE, 'list'));
  const [sortBy, setSortBy] = useState('name');

  // Breadcrumbs history path
  const [pathHistory, setPathHistory] = useState([]);

  // Fetch Folders
  const { data: folders = [], isLoading: isLoadingFolders } = useQuery({
    queryKey: ['folders', currentFolderId],
    queryFn: () => folderService.getFolders(currentFolderId),
  });

  // Fetch Files
  const { data: files = [], isLoading: isLoadingFiles } = useQuery({
    queryKey: ['files', currentFolderId],
    queryFn: () => fileService.getFiles(currentFolderId),
  });

  const handleChangeView = (mode) => {
    setViewMode(mode);
    setStoredItem(STORAGE_KEYS.VIEW_MODE, mode);
  };

  // Open nested folder
  const handleOpenFolder = async (folder) => {
    setCurrentFolderId(folder.id);
    setPathHistory((prev) => [...prev, folder]);
  };

  // Navigate via breadcrumb link
  const handleNavigateBreadcrumb = (folderId) => {
    if (folderId === null) {
      setCurrentFolderId(null);
      setPathHistory([]);
      return;
    }

    const index = pathHistory.findIndex((f) => f.id === folderId);
    if (index !== -1) {
      setCurrentFolderId(folderId);
      setPathHistory(pathHistory.slice(0, index + 1));
    }
  };

  // Mutations for quick actions
  const starFileMutation = useMutation({
    mutationFn: (file) => fileService.toggleStarFile(file.id),
    onSuccess: (updatedFile) => {
      queryClient.invalidateQueries(['files']);
      addToast(
        updatedFile.starred ? `Starred "${updatedFile.name}"` : `Unstarred "${updatedFile.name}"`,
        'info'
      );
    },
  });

  const starFolderMutation = useMutation({
    mutationFn: (folder) => folderService.toggleStarFolder(folder.id),
    onSuccess: (updatedFolder) => {
      queryClient.invalidateQueries(['folders']);
      addToast(
        updatedFolder.starred ? `Starred "${updatedFolder.name}"` : `Unstarred "${updatedFolder.name}"`,
        'info'
      );
    },
  });

  // Client-side search filtering
  const filteredFolders = folders.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#F5F7FA] tracking-tight">Files</h1>
          <p className="text-xs text-[#6B7280] font-medium mt-0.5">
            Manage and organize your cloud files securely
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenNewFolder}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#151821] border border-[#252936] text-xs font-bold text-[#F5F7FA] hover:bg-[#191C25] hover:border-[#7C5CFF]/40 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4 text-[#7C5CFF]" />
            <span>+ Create New Folder</span>
          </button>

          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7C5CFF] hover:bg-[#6D4FF5] text-xs font-bold text-white transition-all shadow-lg shadow-[#7C5CFF]/25"
          >
            <UploadIcon className="w-4 h-4" />
            <span>Upload</span>
          </button>
        </div>
      </div>

      {/* Sub-header Controls Bar (Breadcrumbs & Grid/List Switcher) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-[#151821] border border-[#252936]">
        <Breadcrumbs pathItems={pathHistory} onNavigate={handleNavigateBreadcrumb} />

        <div className="flex items-center gap-3 shrink-0">
          <GridListToggle viewMode={viewMode} onChangeView={handleChangeView} />
        </div>
      </div>

      {/* Top Dashboard Section: Folders Grid (Left 2 cols) + Storage Gauge Card (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Folders Section (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[#F5F7FA]">Folders</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#191C25] text-[#9CA3AF] border border-[#252936]">
                {filteredFolders.length}
              </span>
            </div>
          </div>

          {isLoadingFolders ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <SkeletonFolderCard />
              <SkeletonFolderCard />
              <SkeletonFolderCard />
            </div>
          ) : filteredFolders.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredFolders.map((folder) => (
                <FolderCard
                  key={folder.id}
                  folder={folder}
                  onOpenFolder={handleOpenFolder}
                  onShare={onShare}
                  onRename={onRename}
                  onMove={onMove}
                  onStar={(f) => starFolderMutation.mutate(f)}
                  onDelete={onDelete}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              type="folder"
              title="No Folders Here"
              description="Create a folder to get your files organized."
              action={
                <button
                  onClick={onOpenNewFolder}
                  className="px-4 py-2 rounded-xl bg-[#7C5CFF] text-white text-xs font-bold hover:bg-[#6D4FF5]"
                >
                  Create Folder
                </button>
              }
            />
          )}
        </div>

        {/* Available Storage Card (Right Column) */}
        <div className="lg:col-span-1">
          <StorageCard />
        </div>
      </div>

      {/* Bottom Dashboard Section: Recent Files (Left 2 cols) + Activity Chart (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Recent Files Table / Grid */}
        <div className="lg:col-span-2 bg-[#151821] border border-[#252936] rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#F5F7FA]">Recent Files</h3>
                <p className="text-xs text-[#6B7280]">Files uploaded or modified recently</p>
              </div>
            </div>

            {/* List / Grid Render */}
            {isLoadingFiles ? (
              <div className="space-y-2">
                <SkeletonFileRow />
                <SkeletonFileRow />
                <SkeletonFileRow />
              </div>
            ) : filteredFiles.length > 0 ? (
              viewMode === 'list' ? (
                <div className="space-y-1">
                  {/* Table Header Row */}
                  <div className="flex items-center justify-between px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#6B7280] border-b border-[#252936] mb-1">
                    <span className="flex-1">Name</span>
                    <span className="w-28 hidden sm:block">Size</span>
                    <span className="w-32 hidden md:block">Last Modified</span>
                    <span className="w-32 text-right pr-4 hidden lg:block">Members</span>
                    <span className="w-8"></span>
                  </div>

                  {filteredFiles.map((file) => (
                    <FileRow
                      key={file.id}
                      file={file}
                      onPreview={onPreview}
                      onDownload={(f) => addToast(`Downloading ${f.name}...`, 'info')}
                      onShare={onShare}
                      onRename={onRename}
                      onMove={onMove}
                      onStar={(f) => starFileMutation.mutate(f)}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredFiles.map((file) => (
                    <FileCard
                      key={file.id}
                      file={file}
                      onPreview={onPreview}
                      onDownload={(f) => addToast(`Downloading ${f.name}...`, 'info')}
                      onShare={onShare}
                      onRename={onRename}
                      onMove={onMove}
                      onStar={(f) => starFileMutation.mutate(f)}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              )
            ) : (
              <EmptyState
                type="search"
                title="No Files Found"
                description="Upload files to store them securely in CloudVault."
                action={
                  <button
                    onClick={onOpenUpload}
                    className="px-4 py-2 rounded-xl bg-[#7C5CFF] text-white text-xs font-bold hover:bg-[#6D4FF5]"
                  >
                    Upload File
                  </button>
                }
              />
            )}
          </div>
        </div>

        {/* Activity Chart (Right Column) */}
        <div className="lg:col-span-1">
          <ActivityChart />
        </div>
      </div>
    </div>
  );
};
