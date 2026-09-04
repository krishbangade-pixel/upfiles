import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ToastContainer } from '../common/Toast';
import { NewFolderModal } from '../modals/NewFolderModal';
import { UploadModal } from '../modals/UploadModal';
import { ShareModal } from '../modals/ShareModal';
import { RenameModal } from '../modals/RenameModal';
import { MoveModal } from '../modals/MoveModal';
import { PreviewModal } from '../modals/PreviewModal';

export const Layout = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#18191b] text-white">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Right Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar Navigation */}
        <Topbar />

        {/* Main Content Scroll Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#18191b] text-white">
          <Outlet />
        </main>
      </div>

      {/* Global Toast & Modals */}
      <ToastContainer />
      <NewFolderModal />
      <UploadModal />
      <ShareModal />
      <RenameModal />
      <MoveModal />
      <PreviewModal />
    </div>
  );
};
