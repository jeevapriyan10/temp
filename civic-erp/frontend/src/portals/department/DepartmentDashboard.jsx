import { useEffect, useState } from 'react';
import Topbar from '../../components/Topbar';
import Card from '../../components/Card';
import useAuthStore from '../../store/authStore';
import api from '../../lib/api';

export default function DepartmentDashboard() {
  const { user } = useAuthStore();
  const [department, setDepartment] = useState(null);
  const [services, setServices] = useState([]);

  useEffect(() => {
    if (user?.department_id) {
      api.get(`/departments/${user.department_id}`).then(({ data }) => setDepartment(data));
      api.get('/services/', { params: { department_id: user.department_id } }).then(({ data }) => setServices(data));
    }
  }, [user?.department_id]);

  return (
    <>
      <Topbar
        title={department?.name || 'Department Portal'}
        subtitle="Department overview and service management"
      />
      <div className="p-8 space-y-8">
        {department && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Card title="Working Hours" value={department.working_hours || 'N/A'} icon="🕐" color="civic" />
            <Card title="Escalation Time" value={department.escalation_time_minutes ? `${department.escalation_time_minutes} min` : 'N/A'} icon="⏰" color="amber" />
            <Card title="Services" value={services.length} icon="⚙️" color="green" />
          </div>
        )}

        {department?.description && (
          <div className="glass-card p-6 animate-fadeIn">
            <h3 className="text-sm font-semibold text-surface-400 uppercase tracking-wider mb-2">About</h3>
            <p className="text-surface-200">{department.description}</p>
          </div>
        )}

        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((svc) => {
              const priorityColors = {
                low: 'border-green-500/30',
                medium: 'border-amber-500/30',
                high: 'border-orange-500/30',
                critical: 'border-red-500/30',
              };
              return (
                <div key={svc.id} className={`glass-card-hover p-5 border-l-2 ${priorityColors[svc.default_priority] || ''}`}>
                  <h3 className="font-semibold text-white mb-1">{svc.name}</h3>
                  <p className="text-sm text-surface-400 mb-2">{svc.description || 'No description'}</p>
                  <span className="text-xs text-surface-500 capitalize">Priority: {svc.default_priority}</span>
                </div>
              );
            })}
            {services.length === 0 && (
              <div className="glass-card p-8 col-span-2 text-center">
                <p className="text-surface-400">No services configured yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
