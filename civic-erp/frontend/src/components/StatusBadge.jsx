import React from 'react';

export default function StatusBadge({ status }) {
  const config = {
    reported: { label: 'Reported', classes: 'bg-blue-50 text-blue-700 border-blue-200' },
    verified: { label: 'Verified', classes: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    assigned: { label: 'Assigned', classes: 'bg-purple-50 text-purple-700 border-purple-200' },
    in_progress: { label: 'In Progress', classes: 'bg-amber-50 text-amber-800 border-amber-200' },
    completed: { label: 'Completed', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    citizen_verified: { label: 'Citizen Verified', classes: 'bg-teal-50 text-teal-700 border-teal-200' },
    closed: { label: 'Closed', classes: 'bg-slate-100 text-slate-600 border-slate-200' },
  };

  const item = config[status] || { label: status?.replace('_', ' ') || 'Unknown', classes: 'bg-slate-100 text-slate-700 border-slate-200' };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border capitalize inline-flex items-center gap-1.5 ${item.classes}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
      {item.label}
    </span>
  );
}
