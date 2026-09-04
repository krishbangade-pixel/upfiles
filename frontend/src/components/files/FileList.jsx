import React from 'react';
import { FolderRow } from '../folders/FolderRow';
import { FileRow } from './FileRow';

export const FileList = ({ folders = [], files = [], isTrash = false }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/50 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              <th className="py-2.5 px-4 font-semibold">Name</th>
              <th className="py-2.5 px-4 font-semibold">Owner</th>
              <th className="py-2.5 px-4 font-semibold">Last modified</th>
              <th className="py-2.5 px-4 font-semibold">File size</th>
              <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {folders.map((folder) => (
              <FolderRow key={folder.id} folder={folder} isTrash={isTrash} />
            ))}
            {files.map((file) => (
              <FileRow key={file.id} file={file} isTrash={isTrash} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
