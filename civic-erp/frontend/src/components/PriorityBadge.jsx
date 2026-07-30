import React from 'react';

export default function PriorityBadge({ priority }) {
  const config = {
    low: { label: 'Low', classes: 'bg-slate-100 text-slate-700 border-slate-200' },
    medium: { label: 'Medium', classes: 'bg-blue-50 text-blue-700 border-blue-200' },
    high: { label: 'High', classes: 'bg-orange-50 text-orange-700 border-orange-200' },
    critical: { label: 'Critical', classes: 'bg-red-50 text-red-700 border-red-200' },
  };

  const item = config[priority] || { label: priority || 'Medium', classes: 'bg-slate-100 text-slate-700 border-slate-200' };

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${item.classes}`}>
      {item.label}
    </span>
  );
}
