import React from 'react';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import Avatar from './Avatar';
import { Eye, UserCheck, Clock, MapPin } from 'lucide-react';

const STATUS_COLUMNS = [
  { key: 'reported', label: 'Reported', color: 'border-t-blue-500' },
  { key: 'verified', label: 'Verified', color: 'border-t-indigo-500' },
  { key: 'assigned', label: 'Assigned', color: 'border-t-purple-500' },
  { key: 'in_progress', label: 'In Progress', color: 'border-t-amber-500' },
  { key: 'completed', label: 'Completed', color: 'border-t-emerald-500' },
  { key: 'citizen_verified', label: 'Citizen Verified', color: 'border-t-teal-500' },
  { key: 'closed', label: 'Closed', color: 'border-t-slate-400' },
];

const PRIORITY_BORDER = {
  critical: 'border-l-red-500',
  high: 'border-l-orange-500',
  medium: 'border-l-amber-400',
  low: 'border-l-slate-300',
};

export default function KanbanBoard({ complaints = [], onSelectComplaint, onAssignOfficer }) {
  // Group complaints by status
  const grouped = STATUS_COLUMNS.reduce((acc, col) => {
    acc[col.key] = complaints.filter((c) => c.status === col.key);
    return acc;
  }, {});

  return (
    <div className="flex gap-4 overflow-x-auto pb-6 min-h-[600px] items-start">
      {STATUS_COLUMNS.map((col) => {
        const colComplaints = grouped[col.key] || [];

        return (
          <div
            key={col.key}
            className="w-80 shrink-0 bg-slate-100/70 border border-slate-200/80 rounded-2xl flex flex-col max-h-[800px]"
          >
            {/* Column Header */}
            <div className={`bg-white border-b border-slate-200 p-3.5 rounded-t-2xl border-t-4 ${col.color} flex items-center justify-between shadow-xs`}>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-xs text-slate-800 tracking-tight">{col.label}</h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                  {colComplaints.length}
                </span>
              </div>
            </div>

            {/* Column Cards */}
            <div className="p-3 overflow-y-auto space-y-3 flex-1 min-h-[150px]">
              {colComplaints.length === 0 ? (
                <div className="h-24 border border-dashed border-slate-300/70 rounded-xl flex items-center justify-center text-slate-400 text-xs font-medium">
                  No issues in this stage
                </div>
              ) : (
                colComplaints.map((c) => {
                  const leftAccent = PRIORITY_BORDER[c.priority] || 'border-l-slate-300';
                  const formattedDate = c.created_at ? new Date(c.created_at).toLocaleDateString() : '';

                  return (
                    <div
                      key={c.id}
                      onClick={() => onSelectComplaint && onSelectComplaint(c)}
                      className={`bg-white border border-slate-200 border-l-4 ${leftAccent} rounded-xl p-3.5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer space-y-3 group`}
                    >
                      {/* Top Header: ID, Service & Date */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[10px] font-bold text-slate-400">#{c.id}</span>
                            <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                              {c.service?.name || 'Municipal Issue'}
                            </span>
                          </div>
                          {c.location && (
                            <div className="flex items-center gap-1 text-[11px] text-slate-500">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate max-w-[180px]">{c.location.name}</span>
                            </div>
                          )}
                        </div>
                        <PriorityBadge priority={c.priority} />
                      </div>

                      {/* Description snippet */}
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {c.description}
                      </p>

                      {/* Pill Tags */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {c.department && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                            {c.department.name}
                          </span>
                        )}
                        {c.is_duplicate ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Duplicate #{c.parent_complaint_id}
                          </span>
                        ) : null}
                      </div>

                      {/* Footer: Citizen & Officer Avatars + Date */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center gap-2">
                          <Avatar name={c.citizen?.name || 'Citizen'} size="xs" />
                          <span className="text-[11px] font-medium text-slate-700 truncate max-w-[90px]">
                            {c.citizen?.name || 'Citizen'}
                          </span>
                        </div>

                        {c.officer ? (
                          <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-200/60" title={`Assigned: ${c.officer.name}`}>
                            <Avatar name={c.officer.name} size="xs" />
                            <span className="text-[10px] font-semibold text-slate-700 truncate max-w-[70px]">
                              {c.officer.name}
                            </span>
                          </div>
                        ) : onAssignOfficer ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onAssignOfficer(c);
                            }}
                            className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded-md border border-blue-200 hover:bg-blue-100 transition-all flex items-center gap-1"
                          >
                            <UserCheck className="w-3 h-3" /> Assign
                          </button>
                        ) : (
                          <div className="flex items-center gap-1 text-[10px] text-slate-400">
                            <Clock className="w-3 h-3" /> {formattedDate}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
