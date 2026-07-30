import React from 'react';
import NotificationBell from './NotificationBell';
import Avatar from './Avatar';
import useAuthStore from '../store/authStore';
import { Search, ChevronDown } from 'lucide-react';

export default function Topbar({ title, subtitle, children }) {
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-2xs">
      <div className="flex items-center justify-between px-6 py-3.5 gap-4">
        {/* Left Title */}
        <div className="shrink-0">
          <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">{title}</h1>
          {subtitle && <p className="text-slate-500 text-xs mt-0.5">{subtitle}</p>}
        </div>

        {/* Center Search bar matching reference CRM */}
        <div className="hidden md:flex flex-1 max-w-md mx-4 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search complaints, services, assets..."
            className="w-full bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-slate-900 placeholder:text-slate-400 text-xs rounded-full pl-9 pr-4 py-2 border border-transparent focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>

        {/* Right Actions & User Profile */}
        <div className="flex items-center gap-3 shrink-0">
          {children}
          <NotificationBell />

          {/* User profile dropdown pill */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <Avatar name={user?.name || 'User'} size="sm" />
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-900 leading-none">{user?.name}</p>
              <p className="text-[10px] font-medium text-slate-400 capitalize mt-0.5">{user?.role?.name?.replace('_', ' ')}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
      </div>
    </header>
  );
}
