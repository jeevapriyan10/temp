import React from 'react';

const COLOR_CLASSES = [
  'bg-blue-100 text-blue-700 border-blue-200',
  'bg-emerald-100 text-emerald-700 border-emerald-200',
  'bg-purple-100 text-purple-700 border-purple-200',
  'bg-amber-100 text-amber-700 border-amber-200',
  'bg-indigo-100 text-indigo-700 border-indigo-200',
  'bg-rose-100 text-rose-700 border-rose-200',
  'bg-teal-100 text-teal-700 border-teal-200',
];

export default function Avatar({ name = 'User', size = 'sm', className = '' }) {
  // Extract initials e.g. "Officer One" -> "OO", "Citizen" -> "C"
  const parts = name.trim().split(' ');
  let initials = parts[0] ? parts[0][0].toUpperCase() : 'U';
  if (parts.length > 1 && parts[parts.length - 1]) {
    initials += parts[parts.length - 1][0].toUpperCase();
  }

  // Hash name string to get consistent color index
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorClass = COLOR_CLASSES[Math.abs(hash) % COLOR_CLASSES.length];

  const sizeClasses = {
    xs: 'w-5 h-5 text-[10px]',
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
  }[size] || 'w-7 h-7 text-xs';

  return (
    <div
      className={`rounded-full border font-semibold flex items-center justify-center shrink-0 ${sizeClasses} ${colorClass} ${className}`}
      title={name}
    >
      {initials}
    </div>
  );
}
