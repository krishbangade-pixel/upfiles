import React, { useState, useRef } from 'react';
import { Modal } from '../common/Modal';
import { useDrive } from '../../context/DriveContext';
import { UploadCloud, CheckCircle2, File, AlertCircle } from 'lucide-react';

export const UploadModal = () => {
  const { modalState, closeModal, uploadFilesSimulated } = useDrive();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const isOpen = modalState?.type === 'upload';

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const parsed = files.map((f) => ({
        rawFile: f,
        name: f.name,
        size: f.size,
        type: f.type,
        previewUrl: f.type.startsWith('image/') ? URL.createObjectURL(f) : null,
      }));
      setSelectedFiles(parsed);
      setErrorMsg('');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) {
      const parsed = files.map((f) => ({
        rawFile: f,
        name: f.name,
        size: f.size,
        type: f.type,
        previewUrl: f.type.startsWith('image/') ? URL.createObjectURL(f) : null,
      }));
      setSelectedFiles(parsed);
      setErrorMsg('');
    }
  };

  const startUpload = async () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);
    setProgress(5);
    setErrorMsg('');

    try {
      await uploadFilesSimulated(selectedFiles, (percent) => {
        setProgress(Math.min(100, Math.max(5, percent)));
      });

      setProgress(100);
      setUploading(false);
      setCompleted(true);

      setTimeout(() => {
        handleResetAndClose();
      }, 1500);
    } catch (err) {
      setUploading(false);
      setErrorMsg(err.message || 'Upload failed. Please check storage bucket permissions.');
    }
  };

  const handleResetAndClose = () => {
    setSelectedFiles([]);
    setUploading(false);
    setProgress(0);
    setCompleted(false);
    setErrorMsg('');
    closeModal();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleResetAndClose} title="Upload files">
      <div className="space-y-4">
        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-500 font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {!uploading && !completed ? (
          <>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#63655d] hover:border-[#316d7a] bg-[#3b3d37] rounded-xl p-8 text-center cursor-pointer transition-colors flex flex-col items-center justify-center"
            >
              <UploadCloud className="w-10 h-10 text-[#316d7a] mb-3 stroke-[1.5]" />
              <p className="text-sm font-medium text-white">Drag & drop files here</p>
              <p className="text-xs text-gray-300 mt-1">or click to browse from device</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {selectedFiles.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                <p className="text-xs font-semibold text-gray-300 uppercase">Selected files:</p>
                {selectedFiles.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 bg-[#3b3d37] border border-[#63655d] rounded-lg text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <File className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                      <span className="truncate text-white">{f.name}</span>
                    </div>
                    <span className="text-gray-300 flex-shrink-0">
                      {(f.size / (1024 * 1024)).toFixed(1)} MB
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2 text-xs font-medium text-gray-300 hover:text-white hover:bg-[#51534d] rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={startUpload}
                disabled={selectedFiles.length === 0}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#316d7a] hover:bg-[#275863] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Upload {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}
              </button>
            </div>
          </>
        ) : uploading ? (
          <div className="py-8 text-center space-y-4">
            <p className="text-sm font-medium text-white">Uploading to Supabase Storage...</p>
            <div className="w-full bg-[#3b3d37] rounded-full h-2.5 overflow-hidden border border-[#63655d]">
              <div
                className="bg-[#316d7a] h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-300 font-mono">{progress}% complete</p>
          </div>
        ) : (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <p className="text-sm font-semibold text-white">Upload complete!</p>
            <p className="text-xs text-gray-300">File(s) added to your Drive.</p>
          </div>
        )}
      </div>
    </Modal>
  );
};
