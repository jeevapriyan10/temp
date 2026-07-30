import { useEffect } from 'react';
import Topbar from '../../components/Topbar';
import Card from '../../components/Card';
import useOrgStore from '../../store/orgStore';
import useAuthStore from '../../store/authStore';
import { Building2, Settings, MapPin, Users, Building, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { departments, services, locations, users, fetchDepartments, fetchServices, fetchLocations, fetchUsers } = useOrgStore();
  const { user } = useAuthStore();
  const orgId = user?.org_id;

  useEffect(() => {
    if (orgId) {
      fetchDepartments(orgId);
      fetchServices();
      fetchLocations(orgId);
      fetchUsers(orgId);
    }
  }, [orgId]);

  return (
    <>
      <Topbar title="Executive Overview" subtitle="High-level metrics across all civic operations and departments" />
      <div className="p-6 space-y-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card title="Departments" value={departments.length} icon={<Building2 className="w-5 h-5" />} color="civic" />
          <Card title="Services" value={services.length} icon={<Settings className="w-5 h-5" />} color="green" />
          <Card title="Locations" value={locations.length} icon={<MapPin className="w-5 h-5" />} color="amber" />
          <Card title="Users" value={users.length} icon={<Users className="w-5 h-5" />} color="purple" />
        </div>

        {/* Departments Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Active Departments</h2>
            <Link to="/admin/departments" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((dept) => (
              <div key={dept.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{dept.name}</h3>
                    <p className="text-xs text-slate-500">{dept.working_hours || 'Standard Hours'}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{dept.description || 'No description provided'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
