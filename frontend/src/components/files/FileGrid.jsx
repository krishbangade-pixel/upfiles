import React from 'react';
import { FolderCard } from '../folders/FolderCard';
import { FileCard } from './FileCard';

export const FileGrid = ({ folders = [], files = [], isTrash = false }) => {
  const hasFolders = folders.length > 0;
  const hasFiles = files.length > 0;

  return (
    <div className="space-y-6">
      {hasFolders && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Folders ({folders.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {folders.map((folder) => (
              <FolderCard key={folder.id} folder={folder} isTrash={isTrash} />
            ))}
          </div>
        </div>
      )}

      {hasFiles && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Files ({files.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {files.map((file) => (
              <FileCard key={file.id} file={file} isTrash={isTrash} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
