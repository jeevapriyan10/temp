import { useEffect, useState } from 'react';
import Topbar from '../../components/Topbar';
import Card from '../../components/Card';
import useAuthStore from '../../store/authStore';
import api from '../../lib/api';
import { Building2, Settings, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

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
        title={org?.name || 'Citizen Services Portal'}
        subtitle={org ? `${org.city}, ${org.state}` : 'Welcome to CivicOS'}
      />
      <div className="p-6 space-y-6">
        {/* Welcome banner */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white shadow-md animate-fadeIn">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 text-blue-100 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> Official Municipal Portal
            </div>
            <h2 className="text-xl font-bold mb-1">
              Welcome back, {user?.name}
            </h2>
            <p className="text-blue-100 text-xs max-w-xl leading-relaxed">
              Browse available municipal services from {org?.name || 'your civic organization'}.
              Report issues directly and track live resolution progress.
            </p>
            <div className="mt-4 flex gap-3">
              <Link
                to="/citizen/report"
                className="inline-flex items-center gap-1.5 bg-white text-blue-700 text-xs font-bold px-4 py-2 rounded-lg shadow-xs hover:bg-blue-50 transition-colors"
              >
                Report Issue <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/citizen/track"
                className="inline-flex items-center gap-1.5 bg-blue-700/60 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors border border-blue-400/30"
              >
                Track My Complaints
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Departments Available" value={departments.length} icon={<Building2 className="w-5 h-5" />} color="civic" />
          <Card title="Services Available" value={services.length} icon={<Settings className="w-5 h-5" />} color="green" />
        </div>

        {/* Services by Department */}
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight mb-4">Available Municipal Services</h2>
          <div className="space-y-6">
            {departments.map((dept) => {
              const deptServices = services.filter((s) => s.department_id === dept.id);
              if (deptServices.length === 0) return null;
              return (
                <div key={dept.id} className="animate-fadeIn">
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <h3 className="font-bold text-sm text-slate-900">{dept.name}</h3>
                    <span className="text-xs text-slate-400">({deptServices.length} services)</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {deptServices.map((svc) => (
                      <div key={svc.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:shadow-md transition-all">
                        <h4 className="font-bold text-xs text-slate-900 mb-1">{svc.name}</h4>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{svc.description || 'No description provided'}</p>
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
