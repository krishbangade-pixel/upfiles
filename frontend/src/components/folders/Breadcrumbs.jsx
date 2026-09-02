import React from 'react';
import { ChevronRight, HardDrive, Folder } from 'lucide-react';

export const Breadcrumbs = ({ pathItems = [], onNavigate }) => {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-[#9CA3AF] font-medium overflow-x-auto py-1">
      <button
        onClick={() => onNavigate(null)}
        className="flex items-center gap-1.5 text-[#6B7280] hover:text-[#F5F7FA] transition-colors shrink-0"
      >
        <HardDrive className="w-3.5 h-3.5 text-[#7C5CFF]" />
        <span>My Drive</span>
      </button>

      {pathItems.map((item, idx) => {
        const isLast = idx === pathItems.length - 1;
        return (
          <React.Fragment key={item.id}>
            <ChevronRight className="w-3.5 h-3.5 text-[#6B7280] shrink-0" />
            <button
              onClick={() => onNavigate(item.id)}
              disabled={isLast}
              className={`flex items-center gap-1 shrink-0 transition-colors ${
                isLast
                  ? 'text-[#F5F7FA] font-semibold cursor-default'
                  : 'text-[#6B7280] hover:text-[#F5F7FA]'
              }`}
            >
              <Folder className="w-3.5 h-3.5 text-[#4F8EF7]" />
              <span>{item.name}</span>
            </button>
          </React.Fragment>
        );
      })}
    </nav>
  );
};
