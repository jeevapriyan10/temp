export default function PriorityBadge({ priority }) {
  const config = {
    low: { label: 'Low', classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    medium: { label: 'Medium', classes: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    high: { label: 'High', classes: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    critical: { label: 'Critical', classes: 'bg-red-500/10 text-red-400 border-red-500/30 animate-pulse' },
  };

  const item = config[priority] || { label: priority || 'Medium', classes: 'bg-surface-700 text-surface-300' };

  return (
    <span className={`px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider border ${item.classes}`}>
      {item.label}
    </span>
  );
}
