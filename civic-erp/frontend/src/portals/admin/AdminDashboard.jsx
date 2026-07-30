import { useEffect } from 'react';
import Topbar from '../../components/Topbar';
import Card from '../../components/Card';
import useOrgStore from '../../store/orgStore';
import useAuthStore from '../../store/authStore';

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
      <Topbar title="Dashboard" subtitle="Overview of your civic operations" />
      <div className="p-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card title="Departments" value={departments.length} icon="🏛️" color="civic" />
          <Card title="Services" value={services.length} icon="⚙️" color="green" />
          <Card title="Locations" value={locations.length} icon="📍" color="amber" />
          <Card title="Users" value={users.length} icon="👥" color="purple" />
        </div>

        {/* Department overview */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Departments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((dept) => (
              <div key={dept.id} className="glass-card-hover p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                    style={{ backgroundColor: (dept.color || '#3B82F6') + '20' }}
                  >
                    {dept.icon || '🏢'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{dept.name}</h3>
                    <p className="text-xs text-surface-500">{dept.working_hours || 'N/A'}</p>
                  </div>
                </div>
                <p className="text-sm text-surface-400 line-clamp-2">{dept.description || 'No description'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
