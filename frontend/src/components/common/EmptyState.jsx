import React from 'react';
import { FolderOpen, Search, Star, Trash2, Users, FileX } from 'lucide-react';

export const EmptyState = ({ type = 'folder', title, description, action }) => {
  const getIcon = () => {
    switch (type) {
      case 'search': return Search;
      case 'starred': return Star;
      case 'trash': return Trash2;
      case 'shared': return Users;
      default: return FolderOpen;
    }
  };

  const Icon = getIcon();

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-[#151821]/50 border border-[#252936] my-6">
      <div className="w-16 h-16 rounded-2xl bg-[#191C25] border border-[#252936] flex items-center justify-center mb-4 text-[#7C5CFF]">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-base font-bold text-[#F5F7FA]">{title || 'No items found'}</h3>
      <p className="text-xs text-[#6B7280] max-w-sm mt-1 mb-5">
        {description || 'There are no files or folders available in this section.'}
      </p>
      {action}
    </div>
  );
};
