import { useEffect, useState } from 'react';
import Topbar from '../../components/Topbar';
import Card from '../../components/Card';
import useAuthStore from '../../store/authStore';
import api from '../../lib/api';

export default function CitizenHome() {
  const { user } = useAuthStore();
  const [org, setOrg] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [services, setServices] = useState([]);

  useEffect(() => {
    if (user?.org_id) {
      api.get(`/organizations/${user.org_id}`).then(({ data }) => setOrg(data));
      api.get('/departments/', { params: { org_id: user.org_id } }).then(({ data }) => setDepartments(data));
      api.get('/services/').then(({ data }) => setServices(data));
    }
  }, [user?.org_id]);

  return (
    <>
      <Topbar
        title={org?.name || 'Citizen Portal'}
        subtitle={org ? `${org.city}, ${org.state}` : 'Welcome to CivicOS'}
      />
      <div className="p-8 space-y-8">
        {/* Welcome banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-civic-600 to-civic-800 p-8 animate-fadeIn">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-white mb-2">
              Welcome, {user?.name}
            </h2>
            <p className="text-civic-200 max-w-lg">
              Browse available services from {org?.name || 'your organization'}.
              Raise complaints and track their resolution — all in one place.
            </p>
          </div>
          <div className="absolute -right-8 -top-8 w-48 h-48 bg-white/5 rounded-full blur-xl" />
          <div className="absolute -right-4 bottom-0 w-32 h-32 bg-white/5 rounded-full blur-lg" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card title="Departments Available" value={departments.length} icon="🏛️" color="civic" />
          <Card title="Services Available" value={services.length} icon="⚙️" color="green" />
        </div>

        {/* Services by Department */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Available Services</h2>
          <div className="space-y-6">
            {departments.map((dept) => {
              const deptServices = services.filter((s) => s.department_id === dept.id);
              if (deptServices.length === 0) return null;
              return (
                <div key={dept.id} className="animate-fadeIn">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{dept.icon || '🏢'}</span>
                    <h3 className="font-semibold text-white">{dept.name}</h3>
                    <span className="text-xs text-surface-500">({deptServices.length} services)</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {deptServices.map((svc) => (
                      <div key={svc.id} className="glass-card-hover p-4">
                        <h4 className="font-medium text-surface-200 mb-1">{svc.name}</h4>
                        <p className="text-xs text-surface-500 line-clamp-2">{svc.description || 'No description'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
