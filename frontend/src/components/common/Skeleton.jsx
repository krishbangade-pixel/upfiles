import React from 'react';

export const SkeletonFolderCard = () => (
  <div className="bg-[#151821] border border-[#252936] rounded-2xl p-4 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="w-10 h-10 rounded-xl bg-[#191C25]" />
      <div className="w-6 h-6 rounded-full bg-[#191C25]" />
    </div>
    <div className="h-4 bg-[#191C25] rounded w-3/4 mb-2" />
    <div className="h-3 bg-[#191C25] rounded w-1/2" />
  </div>
);

export const SkeletonFileRow = () => (
  <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#151821] border border-[#252936] animate-pulse">
    <div className="flex items-center gap-3 flex-1">
      <div className="w-9 h-9 rounded-xl bg-[#191C25]" />
      <div className="h-4 bg-[#191C25] rounded w-48" />
    </div>
    <div className="h-4 bg-[#191C25] rounded w-20 hidden sm:block" />
    <div className="h-4 bg-[#191C25] rounded w-24 hidden md:block" />
  </div>
);

export const SkeletonCard = () => (
  <div className="bg-[#151821] border border-[#252936] rounded-2xl p-6 h-full min-h-[220px] animate-pulse">
    <div className="h-5 bg-[#191C25] rounded w-1/3 mb-6" />
    <div className="h-28 bg-[#191C25] rounded-xl w-full" />
  </div>
);
