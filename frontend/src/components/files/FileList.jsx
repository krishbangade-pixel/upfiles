import React from 'react';
import { FolderRow } from '../folders/FolderRow';
import { FileRow } from './FileRow';

export const FileList = ({ folders = [], files = [], isTrash = false }) => {
  return (
    <div className="bg-[#222428] border border-[#34373d] rounded-xl overflow-hidden shadow-md">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#34373d] bg-[#1d1e21] text-[11px] font-semibold text-gray-200 uppercase tracking-wider">
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
