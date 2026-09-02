import React, { useState } from 'react';
import { Upload, X, CheckCircle2, AlertCircle, File, Loader2 } from 'lucide-react';
import { formatBytes } from '../../utils/formatters';

export const UploadModal = ({ isOpen, onClose, onUploadComplete }) => {
  const [uploadQueue, setUploadQueue] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  const handleFilesSelected = (filesList) => {
    const files = Array.from(filesList);
    const newItems = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: file.size,
      progress: 0,
      status: 'uploading', // uploading, completed, error
    }));

    setUploadQueue((prev) => [...prev, ...newItems]);

    // Simulate progress for each file
    newItems.forEach((item) => {
      let current = 0;
      const interval = setInterval(() => {
        current += Math.floor(Math.random() * 25) + 15;
        if (current >= 100) {
          current = 100;
          clearInterval(interval);
          setUploadQueue((prev) =>
            prev.map((i) => (i.id === item.id ? { ...i, progress: 100, status: 'completed' } : i))
          );
          onUploadComplete(item.file);
        } else {
          setUploadQueue((prev) =>
            prev.map((i) => (i.id === item.id ? { ...i, progress: current } : i))
          );
        }
      }, 300);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#151821] border border-[#252936] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-[#F5F7FA]">Upload Files</h3>
            <p className="text-xs text-[#6B7280]">Add files to your cloud storage</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#6B7280] hover:text-[#F5F7FA] hover:bg-[#191C25] rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drag & Drop Target Dropzone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-[#7C5CFF] bg-[#7C5CFF]/10 scale-[0.99]'
              : 'border-[#252936] bg-[#11141B] hover:border-[#7C5CFF]/50'
          }`}
          onClick={() => document.getElementById('file-upload-input').click()}
        >
          <div className="w-12 h-12 rounded-2xl bg-[#7C5CFF]/15 border border-[#7C5CFF]/30 flex items-center justify-center mb-3">
            <Upload className="w-6 h-6 text-[#7C5CFF]" />
          </div>
          <p className="text-xs font-semibold text-[#F5F7FA]">
            Drag & drop files here, or <span className="text-[#7C5CFF] underline">browse</span>
          </p>
          <p className="text-[11px] text-[#6B7280] mt-1">Supports images, documents, videos up to 2 GB</p>
          <input
            id="file-upload-input"
            type="file"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleFilesSelected(e.target.files)}
          />
        </div>

        {/* Upload Progress Queue */}
        {uploadQueue.length > 0 && (
          <div className="mt-5 space-y-3 max-h-52 overflow-y-auto pr-1">
            <h4 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Upload Queue</h4>
            {uploadQueue.map((item) => (
              <div key={item.id} className="p-3 bg-[#11141B] border border-[#252936] rounded-xl">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <File className="w-4 h-4 text-[#7C5CFF] shrink-0" />
                    <span className="font-semibold text-[#F5F7FA] truncate">{item.name}</span>
                    <span className="text-[11px] text-[#6B7280]">({formatBytes(item.size)})</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 font-medium">
                    {item.status === 'uploading' && (
                      <>
                        <Loader2 className="w-3.5 h-3.5 text-[#7C5CFF] animate-spin" />
                        <span className="text-[#7C5CFF] text-[11px]">{item.progress}%</span>
                      </>
                    )}
                    {item.status === 'completed' && (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                        <span className="text-[#22C55E] text-[11px]">Completed</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Progress bar line */}
                <div className="w-full h-1.5 bg-[#191C25] rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      item.status === 'completed' ? 'bg-[#22C55E]' : 'bg-[#7C5CFF]'
                    }`}
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#9CA3AF] hover:text-[#F5F7FA] hover:bg-[#191C25] rounded-xl transition-colors border border-[#252936]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
