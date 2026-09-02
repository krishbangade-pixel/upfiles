import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { DrivePage } from '../../pages/Drive';
import { SharedPage } from '../../pages/Shared';
import { StarredPage } from '../../pages/Starred';
import { RecentPage } from '../../pages/Recent';
import { TrashPage } from '../../pages/Trash';
import { SettingsPage } from '../../pages/Settings';
import { UploadModal } from '../modals/UploadModal';
import { NewFolderModal } from '../modals/NewFolderModal';
import { ShareModal } from '../modals/ShareModal';
import { RenameModal } from '../modals/RenameModal';
import { MoveModal } from '../modals/MoveModal';
import { DeleteModal } from '../modals/DeleteModal';
import { FilePreviewModal } from '../modals/FilePreviewModal';
import { folderService } from '../../services/folderService';
import { fileService } from '../../services/fileService';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../context/ToastContext';

export const MainLayout = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [uploadOpen, setUploadOpen] = useState(false);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [shareItem, setShareItem] = useState(null);
  const [renameItem, setRenameItem] = useState(null);
  const [moveItem, setMoveItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);

  // Folder creation handler
  const handleCreateFolder = async ({ name, color }) => {
    try {
      await folderService.createFolder({ name, color });
      queryClient.invalidateQueries(['folders']);
      addToast(`Folder "${name}" created successfully`, 'success');
    } catch (err) {
      addToast('Failed to create folder', 'error');
    }
  };

  // Upload handler
  const handleUploadComplete = async (fileObj) => {
    try {
      await fileService.uploadFile({ file: fileObj });
      queryClient.invalidateQueries(['files']);
      addToast(`File "${fileObj.name}" uploaded successfully`, 'success');
    } catch (err) {
      addToast('Upload failed', 'error');
    }
  };

  // Rename handler
  const handleRenameConfirm = async (id, newName) => {
    try {
      if (renameItem.fileCount !== undefined) {
        await folderService.renameFolder(id, newName);
        queryClient.invalidateQueries(['folders']);
      } else {
        await fileService.renameFile(id, newName);
        queryClient.invalidateQueries(['files']);
      }
      addToast(`Renamed to "${newName}"`, 'success');
    } catch (err) {
      addToast('Rename failed', 'error');
    }
  };

  // Move handler
  const handleMoveConfirm = async (id, targetFolderId) => {
    try {
      await fileService.moveFile(id, targetFolderId);
      queryClient.invalidateQueries(['files']);
      addToast('File moved successfully', 'success');
    } catch (err) {
      addToast('Move failed', 'error');
    }
  };

  // Delete handler
  const handleDeleteConfirm = async (id) => {
    try {
      if (deleteItem.fileCount !== undefined) {
        await folderService.deleteFolder(id);
        queryClient.invalidateQueries(['folders']);
        addToast(`Moved folder "${deleteItem.name}" to trash`, 'info');
      } else {
        await fileService.deleteFile(id);
        queryClient.invalidateQueries(['files']);
        queryClient.invalidateQueries(['trash']);
        addToast(`Moved file "${deleteItem.name}" to trash`, 'info');
      }
    } catch (err) {
      addToast('Delete failed', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#F5F7FA] flex flex-col lg:flex-row">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Topbar Header */}
        <Topbar
          onOpenSidebar={() => setSidebarOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* View Router */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/drive" replace />} />
            <Route
              path="/drive"
              element={
                <DrivePage
                  onOpenUpload={() => setUploadOpen(true)}
                  onOpenNewFolder={() => setNewFolderOpen(true)}
                  onShare={(item) => setShareItem(item)}
                  onRename={(item) => setRenameItem(item)}
                  onMove={(item) => setMoveItem(item)}
                  onDelete={(item) => setDeleteItem(item)}
                  onPreview={(file) => setPreviewFile(file)}
                  searchQuery={searchQuery}
                />
              }
            />
            <Route
              path="/shared"
              element={
                <SharedPage
                  onPreview={(file) => setPreviewFile(file)}
                  onShare={(item) => setShareItem(item)}
                />
              }
            />
            <Route
              path="/starred"
              element={
                <StarredPage
                  onPreview={(file) => setPreviewFile(file)}
                  onDownload={(file) => addToast(`Downloading ${file.name}...`, 'info')}
                  onShare={(item) => setShareItem(item)}
                  onRename={(item) => setRenameItem(item)}
                  onMove={(item) => setMoveItem(item)}
                  onDelete={(item) => setDeleteItem(item)}
                />
              }
            />
            <Route
              path="/recent"
              element={
                <RecentPage
                  onPreview={(file) => setPreviewFile(file)}
                  onDownload={(file) => addToast(`Downloading ${file.name}...`, 'info')}
                  onShare={(item) => setShareItem(item)}
                  onRename={(item) => setRenameItem(item)}
                  onMove={(item) => setMoveItem(item)}
                  onDelete={(item) => setDeleteItem(item)}
                />
              }
            />
            <Route path="/trash" element={<TrashPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/help" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/drive" replace />} />
          </Routes>
        </main>
      </div>

      {/* Global Modals */}
      <UploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploadComplete={handleUploadComplete}
      />
      <NewFolderModal
        isOpen={newFolderOpen}
        onClose={() => setNewFolderOpen(false)}
        onCreateFolder={handleCreateFolder}
      />
      <ShareModal
        isOpen={!!shareItem}
        item={shareItem}
        onClose={() => setShareItem(null)}
      />
      <RenameModal
        isOpen={!!renameItem}
        item={renameItem}
        onClose={() => setRenameItem(null)}
        onRenameConfirm={handleRenameConfirm}
      />
      <MoveModal
        isOpen={!!moveItem}
        item={moveItem}
        onClose={() => setMoveItem(null)}
        onMoveConfirm={handleMoveConfirm}
      />
      <DeleteModal
        isOpen={!!deleteItem}
        item={deleteItem}
        onClose={() => setDeleteItem(null)}
        onDeleteConfirm={handleDeleteConfirm}
      />
      <FilePreviewModal
        isOpen={!!previewFile}
        file={previewFile}
        onClose={() => setPreviewFile(null)}
        onDownload={(file) => addToast(`Downloading ${file.name}...`, 'info')}
        onShare={(file) => {
          setPreviewFile(null);
          setShareItem(file);
        }}
      />
    </div>
  );
};
