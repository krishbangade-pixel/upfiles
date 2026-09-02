import React from 'react';
import { Film, FileText, Music, Folder, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MOCK_STORAGE_STATS } from '../../data/mockData';

export const StorageCard = () => {
  const navigate = useNavigate();
  const { usedBytes, totalBytes, percentage, categories } = MOCK_STORAGE_STATS;

  // SVG Gauge calculations
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getCategoryIcon = (iconName) => {
    switch (iconName) {
      case 'Film': return Film;
      case 'FileText': return FileText;
      case 'Music': return Music;
      default: return Folder;
    }
  };

  return (
    <div className="bg-[#151821] border border-[#252936] rounded-2xl p-5 flex flex-col justify-between h-full hover:border-[#252936]/80 transition-all shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#F5F7FA]">Available Storage</h3>
        <button
          onClick={() => navigate('/settings')}
          className="text-xs text-[#7C5CFF] hover:underline font-medium flex items-center gap-1"
        >
          Manage Storage <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Circular Gauge Centerpiece */}
      <div className="flex items-center gap-6 my-2 p-3 bg-[#11141B]/60 rounded-xl border border-[#252936]">
        <div className="relative flex items-center justify-center w-24 h-24 shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background track circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              className="text-[#191C25]"
              strokeWidth="10"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Progress indicator gradient circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              className="text-[#7C5CFF] transition-all duration-1000 ease-out"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-xl font-extrabold text-[#F5F7FA] tracking-tight">{percentage}%</span>
            <span className="text-[10px] font-semibold text-[#6B7280]">USED</span>
          </div>
        </div>

        <div>
          <p className="text-xs text-[#6B7280] font-medium">Total Usage</p>
          <p className="text-base font-bold text-[#F5F7FA] mt-0.5">
            130.0 GB <span className="text-xs text-[#6B7280] font-normal">/ 150 GB</span>
          </p>
          <p className="text-[11px] text-[#22C55E] font-medium mt-1">20.0 GB Free remaining</p>
        </div>
      </div>

      {/* Categories Breakdown List */}
      <div className="space-y-2.5 mt-2">
        {categories.map((cat) => {
          const Icon = getCategoryIcon(cat.icon);
          return (
            <div key={cat.name} className="flex items-center justify-between p-2 rounded-xl hover:bg-[#191C25] transition-colors">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-medium text-[#F5F7FA]">{cat.name}</span>
              </div>
              <span className="text-xs font-semibold text-[#9CA3AF]">{cat.sizeGB} GB</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
