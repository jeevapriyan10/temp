import React from 'react';

export default function Card({ title, value, icon, color = 'civic', children }) {
  const iconColorMap = {
    civic: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs animate-fadeIn hover:border-slate-300 transition-all">
      <div className="flex items-start justify-between">
        <div>
          {title && <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{title}</p>}
          {value !== undefined && <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>}
        </div>
        {icon && (
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${iconColorMap[color] || iconColorMap.civic}`}>
            {icon}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}
