import { NavLink } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import Avatar from './Avatar';
import {
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  Building2,
  Settings,
  Users,
  Shield,
  MapPin,
  Package,
  CheckSquare,
  Home,
  FilePlus,
  Search,
  LogOut,
  Landmark,
} from 'lucide-react';

const groupedSidebarConfig = {
  admin: [
    {
      section: 'Operations',
      items: [
        { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { label: 'Complaints', path: '/admin/complaints', icon: ClipboardList },
      ],
    },
    {
      section: 'Insights',
      items: [{ label: 'Analytics', path: '/admin/analytics', icon: BarChart3 }],
    },
    {
      section: 'Configuration',
      items: [
        { label: 'Departments', path: '/admin/departments', icon: Building2 },
        { label: 'Services', path: '/admin/services', icon: Settings },
        { label: 'Users', path: '/admin/users', icon: Users },
        { label: 'Roles', path: '/admin/roles', icon: Shield },
        { label: 'Locations', path: '/admin/locations', icon: MapPin },
      ],
    },
  ],
  department: [
    {
      section: 'Operations',
      items: [
        { label: 'Dashboard', path: '/department', icon: LayoutDashboard },
        { label: 'Inventory', path: '/department/inventory', icon: Package },
      ],
    },
  ],
  officer: [
    {
      section: 'Field Tasks',
      items: [{ label: "Today's Tasks", path: '/officer', icon: CheckSquare }],
    },
  ],
  citizen: [
    {
      section: 'Citizen Hub',
      items: [
        { label: 'Home', path: '/citizen', icon: Home },
        { label: 'Report Issue', path: '/citizen/report', icon: FilePlus },
        { label: 'Track Issues', path: '/citizen/track', icon: Search },
      ],
    },
  ],
};

export default function Sidebar({ portal = 'admin' }) {
  const { user, logout } = useAuthStore();
  const sections = groupedSidebarConfig[portal] || groupedSidebarConfig.admin;

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-white border-r border-slate-200 flex flex-col z-40 shadow-xs">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-100 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
          <Landmark className="w-4 h-4" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-none">CivicOS</h1>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-1">{portal} Portal</p>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        {sections.map((sec, idx) => (
          <div key={idx}>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1.5">
              {sec.section}
            </div>
            <div className="space-y-0.5">
              {sec.items.map((link) => {
                const IconComponent = link.icon;
                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    end={link.path === `/${portal}`}
                    className={({ isActive }) =>
                      isActive
                        ? 'flex items-center gap-2.5 px-3 py-2 rounded-lg font-semibold text-xs bg-blue-50 text-blue-600 border-l-4 border-blue-600 transition-all'
                        : 'flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-600 font-medium text-xs hover:bg-slate-100 hover:text-slate-900 transition-all'
                    }
                  >
                    <IconComponent className="w-4 h-4 shrink-0" />
                    <span>{link.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Sign Out Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <button
          onClick={() => {
            logout();
            window.location.href = '/login';
          }}
          className="w-full px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all flex items-center justify-between border border-slate-200/80 bg-white shadow-2xs"
        >
          <span>Sign out</span>
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
