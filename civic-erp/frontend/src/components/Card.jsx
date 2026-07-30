export default function Card({ title, value, icon, color = 'civic', children }) {
  const colorMap = {
    civic: 'from-civic-500/10 to-civic-600/5 border-civic-500/20',
    green: 'from-emerald-500/10 to-emerald-600/5 border-emerald-500/20',
    amber: 'from-amber-500/10 to-amber-600/5 border-amber-500/20',
    red: 'from-red-500/10 to-red-600/5 border-red-500/20',
    purple: 'from-purple-500/10 to-purple-600/5 border-purple-500/20',
  };

  const iconColorMap = {
    civic: 'bg-civic-500/20 text-civic-400',
    green: 'bg-emerald-500/20 text-emerald-400',
    amber: 'bg-amber-500/20 text-amber-400',
    red: 'bg-red-500/20 text-red-400',
    purple: 'bg-purple-500/20 text-purple-400',
  };

  return (
    <div className={`rounded-xl border bg-gradient-to-br p-5 ${colorMap[color]} animate-fadeIn`}>
      <div className="flex items-start justify-between">
        <div>
          {title && <p className="text-sm text-surface-400 font-medium mb-1">{title}</p>}
          {value !== undefined && <p className="text-2xl font-bold text-white">{value}</p>}
        </div>
        {icon && (
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${iconColorMap[color]}`}>
            {icon}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}
