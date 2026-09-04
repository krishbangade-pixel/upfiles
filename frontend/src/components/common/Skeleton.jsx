import React from 'react';

export const SkeletonFolderCard = () => (
  <div className="p-4 bg-white border border-gray-200 rounded-lg animate-pulse">
    <div className="flex items-center justify-between mb-3">
      <div className="w-8 h-8 bg-gray-100 rounded-md" />
      <div className="w-4 h-4 bg-gray-100 rounded" />
    </div>
    <div className="h-4 bg-gray-100 rounded w-3/4 mb-1.5" />
    <div className="h-3 bg-gray-50 rounded w-1/2" />
  </div>
);

export const SkeletonFileCard = () => (
  <div className="p-4 bg-white border border-gray-200 rounded-lg animate-pulse">
    <div className="flex items-center justify-between mb-3">
      <div className="w-7 h-7 bg-gray-100 rounded-md" />
      <div className="w-4 h-4 bg-gray-100 rounded" />
    </div>
    <div className="h-4 bg-gray-100 rounded w-4/5 mb-1.5" />
    <div className="h-3 bg-gray-50 rounded w-1/3" />
  </div>
);

export const SkeletonRow = () => (
  <div className="flex items-center justify-between p-3.5 border-b border-gray-100 animate-pulse">
    <div className="flex items-center gap-3 w-1/3">
      <div className="w-5 h-5 bg-gray-100 rounded" />
      <div className="h-4 bg-gray-100 rounded w-40" />
    </div>
    <div className="h-3 bg-gray-100 rounded w-20" />
    <div className="h-3 bg-gray-100 rounded w-24" />
    <div className="h-3 bg-gray-100 rounded w-16" />
    <div className="w-4 h-4 bg-gray-100 rounded" />
  </div>
);
