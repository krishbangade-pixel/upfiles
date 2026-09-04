import React from 'react';
import { Home, ChevronRight } from 'lucide-react';
import { useDrive } from '../context/DriveContext';

export const Breadcrumbs = () => {
  const { currentFolderId, setCurrentFolderId, folders } = useDrive();

  // Build trail of parent folders up to root
  const getFolderTrail = (folderId) => {
    const trail = [];
    let currId = folderId;
    while (currId) {
      const folder = folders.find((f) => f.id === currId);
      if (folder) {
        trail.unshift(folder);
        currId = folder.parentId;
      } else {
        break;
      }
    }
    return trail;
  };

  const trail = getFolderTrail(currentFolderId);

  return (
    <nav className="flex items-center gap-1.5 text-xs text-gray-500 font-medium my-1.5">
      <button
        onClick={() => setCurrentFolderId(null)}
        className="flex items-center gap-1 hover:text-gray-900 transition-colors p-1 rounded hover:bg-gray-100"
        title="Home (My Drive)"
      >
        <Home className="w-3.5 h-3.5 text-gray-600" />
      </button>

      {trail.map((folder, idx) => {
        const isLast = idx === trail.length - 1;
        return (
          <React.Fragment key={folder.id}>
            <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
            <button
              onClick={() => setCurrentFolderId(folder.id)}
              disabled={isLast}
              className={`p-1 rounded text-xs truncate max-w-[150px] transition-colors ${
                isLast
                  ? 'text-gray-900 font-semibold cursor-default'
                  : 'hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {folder.name}
            </button>
          </React.Fragment>
        );
      })}
    </nav>
  );
};
