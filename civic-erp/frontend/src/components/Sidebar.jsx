import { NavLink } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const sidebarConfig = {
  admin: [
    { label: 'Dashboard', path: '/admin', icon: '📊' },
    { label: 'Departments', path: '/admin/departments', icon: '🏛️' },
    { label: 'Services', path: '/admin/services', icon: '⚙️' },
    { label: 'Users', path: '/admin/users', icon: '👥' },
    { label: 'Roles', path: '/admin/roles', icon: '🛡️' },
    { label: 'Locations', path: '/admin/locations', icon: '📍' },
  ],
  department: [
    { label: 'Dashboard', path: '/department', icon: '📊' },
  ],
  officer: [
    { label: 'Dashboard', path: '/officer', icon: '📊' },
  ],
  citizen: [
    { label: 'Home', path: '/citizen', icon: '🏠' },
  ],
};

export default function Sidebar({ portal = 'admin' }) {
  const { user, logout } = useAuthStore();
  const links = sidebarConfig[portal] || sidebarConfig.admin;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-surface-900/95 backdrop-blur-xl border-r border-surface-700/50 flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-surface-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-civic-500 to-civic-700 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-civic-500/20">
            C
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">CivicOS</h1>
            <p className="text-xs text-surface-500 capitalize">{portal} Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.path === `/${portal}`}
            className={({ isActive }) =>
              isActive ? 'sidebar-link-active' : 'sidebar-link'
            }
          >
            <span className="text-lg">{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-surface-700/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-lg bg-surface-700 flex items-center justify-center text-surface-300 text-sm font-semibold">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-surface-200 truncate">{user?.name}</p>
            <p className="text-xs text-surface-500 truncate">{user?.role?.name?.replace('_', ' ')}</p>
          </div>
        </div>
        <button
          onClick={() => { logout(); window.location.href = '/login'; }}
          className="w-full text-left px-3 py-2 rounded-lg text-sm text-surface-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
