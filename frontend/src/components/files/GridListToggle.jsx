import React from 'react';
import { LayoutGrid, List } from 'lucide-react';

export const GridListToggle = ({ viewMode, onChangeView }) => {
  return (
    <div className="flex items-center p-1 rounded-xl bg-[#11141B] border border-[#252936]">
      <button
        onClick={() => onChangeView('grid')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
          viewMode === 'grid'
            ? 'bg-[#151821] text-[#7C5CFF] shadow-sm border border-[#252936]'
            : 'text-[#6B7280] hover:text-[#F5F7FA]'
        }`}
        title="Grid View"
      >
        <LayoutGrid className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Grid</span>
      </button>

      <button
        onClick={() => onChangeView('list')}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
          viewMode === 'list'
            ? 'bg-[#151821] text-[#7C5CFF] shadow-sm border border-[#252936]'
            : 'text-[#6B7280] hover:text-[#F5F7FA]'
        }`}
        title="List View"
      >
        <List className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">List</span>
      </button>
    </div>
  );
};
