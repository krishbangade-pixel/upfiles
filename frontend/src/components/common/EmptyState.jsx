import React from 'react';
import { FolderOpen, Search, Trash2, Star, Users, Clock } from 'lucide-react';

export const EmptyState = ({ type = 'empty', title, message }) => {
  const getIcon = () => {
    switch (type) {
      case 'search':
        return <Search className="w-10 h-10 text-gray-300 stroke-[1.5]" />;
      case 'trash':
        return <Trash2 className="w-10 h-10 text-gray-300 stroke-[1.5]" />;
      case 'starred':
        return <Star className="w-10 h-10 text-gray-300 stroke-[1.5]" />;
      case 'shared':
        return <Users className="w-10 h-10 text-gray-300 stroke-[1.5]" />;
      case 'recent':
        return <Clock className="w-10 h-10 text-gray-300 stroke-[1.5]" />;
      default:
        return <FolderOpen className="w-10 h-10 text-gray-300 stroke-[1.5]" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
        {getIcon()}
      </div>
      <p className="text-sm text-gray-500 max-w-sm">
        {message || 'No matching files or folders found.'}
      </p>
    </div>
  );
};
