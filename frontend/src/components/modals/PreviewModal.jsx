import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useDrive } from '../../context/DriveContext';
import { fileService } from '../../services/fileService';
import { FileIcon } from '../files/FileIcon';
import { Download, Share2, FileText, Calendar, HardDrive, User, Loader2 } from 'lucide-react';

export const PreviewModal = () => {
  const { modalState, closeModal, openModal, addToast } = useDrive();

  const isOpen = modalState?.type === 'preview';
  const file = modalState?.item;

  const [previewUrl, setPreviewUrl] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const targetKeyOrId = file?.id || file?.storageKey;
    if (isOpen && targetKeyOrId) {
      setLoadingPreview(true);
      fileService.getSignedPreviewUrl(targetKeyOrId, 3600).then((url) => {
        if (isMounted) {
          setPreviewUrl(url);
          setLoadingPreview(false);
        }
      });
    } else {
      setPreviewUrl(null);
      setLoadingPreview(false);
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen, file?.id, file?.storageKey]);

  if (!file) return null;

  const ext = (file.extension || file.type || '').toLowerCase();
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext);
  const isPdf = ext === 'pdf';
  const isVideo = ['mp4', 'mov', 'avi', 'webm'].includes(ext);

  const handleDownload = async () => {
    addToast(`Preparing download for "${file.name}"...`, 'info');
    try {
      const targetKeyOrId = file.id || file.storageKey;
      const signedUrl = await fileService.getSignedDownloadUrl(targetKeyOrId, 300);
      if (signedUrl) {
        const a = document.createElement('a');
        a.href = signedUrl;
        a.download = file.name;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        addToast(`Download started!`);
      } else {
        addToast('Failed to generate download link', 'error');
      }
    } catch (err) {
      addToast('Download error', 'error');
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '--';
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title={file.name}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5">
        {/* Preview Container */}
        <div className="w-full bg-gray-50 border border-gray-200 rounded-xl overflow-hidden min-h-[220px] max-h-[360px] flex items-center justify-center relative p-4">
          {loadingPreview ? (
            <div className="flex flex-col items-center gap-2 text-xs text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-900" />
              <span>Loading preview from Supabase Storage...</span>
            </div>
          ) : isImage && (previewUrl || file.previewUrl) ? (
            <img
              src={previewUrl || file.previewUrl}
              alt={file.name}
              className="max-h-[320px] w-auto object-contain rounded-lg shadow-xs"
            />
          ) : isPdf && previewUrl ? (
            <iframe
              src={previewUrl}
              title={file.name}
              className="w-full h-[320px] rounded-lg border-0"
            />
          ) : isVideo && previewUrl ? (
            <video
              key={previewUrl}
              src={previewUrl}
              controls
              autoPlay
              playsInline
              preload="auto"
              className="max-h-[320px] w-full rounded-lg"
              onError={(e) => console.error('Video element playback error:', e)}
            >
              Your browser does not support video playback.
            </video>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
              <FileIcon type={file.type} extension={file.extension} className="w-16 h-16" />
              <p className="text-sm font-semibold text-gray-800">{file.name}</p>
              <p className="text-xs text-gray-500">Preview unavailable for this file format</p>
            </div>
          )}
        </div>

        {/* File Metadata Details */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50/80 p-3.5 rounded-lg border border-gray-100 text-xs">
          <div className="space-y-1">
            <span className="text-gray-400 font-medium flex items-center gap-1">
              <HardDrive className="w-3.5 h-3.5" /> File size
            </span>
            <p className="font-semibold text-gray-800">{file.formattedSize || '0 KB'}</p>
          </div>
          <div className="space-y-1">
            <span className="text-gray-400 font-medium flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" /> Type
            </span>
            <p className="font-semibold text-gray-800 uppercase">{file.extension || file.type || 'FILE'}</p>
          </div>
          <div className="space-y-1">
            <span className="text-gray-400 font-medium flex items-center gap-1">
              <User className="w-3.5 h-3.5" /> Owner
            </span>
            <p className="font-semibold text-gray-800">{file.owner || 'You'}</p>
          </div>
          <div className="space-y-1">
            <span className="text-gray-400 font-medium flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Modified
            </span>
            <p className="font-semibold text-gray-800">{formatDate(file.updatedAt)}</p>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                closeModal();
                openModal('share', file, { isFolder: false });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </button>
          </div>
          <button
            type="button"
            onClick={closeModal}
            className="px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
