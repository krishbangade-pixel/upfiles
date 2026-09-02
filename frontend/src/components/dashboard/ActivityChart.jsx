import React, { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fileService } from '../../services/fileService';
import { getFileTypeCategory } from '../../utils/formatters';

export const ActivityChart = () => {
  const [timeframe, setTimeframe] = useState('Last 7 days');

  const { data: allFiles = [] } = useQuery({
    queryKey: ['files'],
    queryFn: () => fileService.getAllFiles(),
  });

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const chartData = daysOfWeek.map((day) => {
    let Media = 0;
    let Photos = 0;
    let Docs = 0;

    allFiles.forEach((file) => {
      const cat = getFileTypeCategory(file.name, file.type);
      const fileDate = new Date(file.lastModified || file.createdAt);
      const dayName = fileDate.toLocaleDateString('en-US', { weekday: 'short' });
      if (dayName === day) {
        if (cat === 'video') Media += 1;
        else if (cat === 'image') Photos += 1;
        else if (cat === 'document' || cat === 'pdf' || cat === 'spreadsheet') Docs += 1;
      }
    });

    return { day, Media, Photos, Docs };
  });

  return (
    <div className="bg-[#151821] border border-[#252936] rounded-2xl p-5 flex flex-col justify-between h-full hover:border-[#252936]/80 transition-all shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#F5F7FA]">Activity Chart</h3>

        <div className="relative">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#11141B] border border-[#252936] text-xs text-[#9CA3AF]">
            <Calendar className="w-3.5 h-3.5 text-[#7C5CFF]" />
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="bg-transparent text-xs text-[#F5F7FA] focus:outline-none cursor-pointer"
            >
              <option value="Last 7 days" className="bg-[#151821]">Last 7 days</option>
              <option value="Last 30 days" className="bg-[#151821]">Last 30 days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Recharts Bar Chart */}
      <div className="w-full h-48 sm:h-56 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barGap={4} barCategoryGap="20%">
            <XAxis
              dataKey="day"
              stroke="#6B7280"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#252936' }}
            />
            <YAxis
              stroke="#6B7280"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#191C25',
                borderColor: '#252936',
                borderRadius: '12px',
                color: '#F5F7FA',
                fontSize: '12px',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
              }}
              itemStyle={{ color: '#F5F7FA' }}
              cursor={{ fill: 'rgba(124, 92, 255, 0.05)' }}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              formatter={(value) => <span className="text-[#9CA3AF] font-medium">{value}</span>}
            />
            <Bar dataKey="Media" fill="#4F8EF7" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Photos" fill="#7C5CFF" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Docs" fill="#22C55E" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
