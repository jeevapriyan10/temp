export default function StatusBadge({ status }) {
  const config = {
    reported: { label: 'Reported', classes: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    verified: { label: 'Verified', classes: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    assigned: { label: 'Assigned', classes: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    in_progress: { label: 'In Progress', classes: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
    completed: { label: 'Completed', classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    citizen_verified: { label: 'Citizen Verified', classes: 'bg-teal-500/10 text-teal-400 border-teal-500/20' },
    closed: { label: 'Closed', classes: 'bg-surface-700 text-surface-400 border-surface-600' },
  };

  const item = config[status] || { label: status?.replace('_', ' ') || 'Unknown', classes: 'bg-surface-700 text-surface-300' };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border capitalize inline-flex items-center gap-1.5 ${item.classes}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {item.label}
    </span>
  );
}
