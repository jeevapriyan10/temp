import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import Topbar from '../../components/Topbar';
import Card from '../../components/Card';
import useAuthStore from '../../store/authStore';
import api from '../../lib/api';
import { Sparkles, ClipboardList, Clock, AlertTriangle } from 'lucide-react';

const COLORS = ['#2563eb', '#7c3aed', '#d97706', '#ea580c', '#059669', '#0d9488', '#475569'];

export default function AnalyticsPage() {
  const { user } = useAuthStore();
  const [analytics, setAnalytics] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    if (user?.org_id) {
      try {
        const [anaRes, aiRes] = await Promise.all([
          api.get('/analytics/summary', { params: { org_id: user.org_id } }),
          api.get('/ai/insights', { params: { org_id: user.org_id } }),
        ]);
        setAnalytics(anaRes.data);
        setInsights(aiRes.data.insights || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [user?.org_id]);

  if (loading) {
    return (
      <>
        <Topbar title="Operations Analytics" subtitle="Real-time KPI metrics & visualization" />
        <div className="p-8 text-center text-slate-500 text-sm font-medium">Loading analytics...</div>
      </>
    );
  }

  // Format status data for Pie Chart
  const statusPieData = analytics?.status_counts
    ? Object.entries(analytics.status_counts)
        .map(([status, count]) => ({
          name: status.replace('_', ' ').toUpperCase(),
          value: count,
        }))
        .filter((d) => d.value > 0)
    : [];

  // Format dept data for Bar Chart
  const deptBarData = analytics?.department_counts || [];

  // Format daily trend for Line Chart
  const lineData = analytics?.daily_trend || [];

  return (
    <>
      <Topbar title="Operations Analytics" subtitle="Real-time KPI metrics & visualization" />

      <div className="p-6 space-y-6">
        {/* AI Executive Insights Card */}
        {insights.length > 0 && (
          <div className="bg-white border border-blue-200 rounded-xl p-5 shadow-xs border-l-4 border-l-blue-600 bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-white animate-fadeIn">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">AI Executive Operations Summary</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
                Realtime Data-Grounded
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {insights.map((text, idx) => (
                <div key={idx} className="flex items-start gap-2.5 bg-white p-3 rounded-lg border border-slate-200/80 shadow-2xs">
                  <span className="text-blue-600 font-bold text-xs shrink-0 mt-0.5">#{idx + 1}</span>
                  <p className="text-xs text-slate-700 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card
            title="Total Complaints Logged"
            value={analytics?.total_complaints || 0}
            icon={<ClipboardList className="w-5 h-5" />}
            color="civic"
          />
          <Card
            title="Avg Resolution Time"
            value={`${analytics?.avg_resolution_time_minutes || 0} mins`}
            icon={<Clock className="w-5 h-5" />}
            color="green"
          />
          <Card
            title="Critical Priority Complaints"
            value={analytics?.priority_counts?.critical || 0}
            icon={<AlertTriangle className="w-5 h-5" />}
            color="red"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart: Complaints by Department */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs animate-fadeIn">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Complaints by Department</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptBarData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="department_name" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                    itemStyle={{ color: '#2563eb', fontWeight: 600 }}
                  />
                  <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart: Status Breakdown */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs animate-fadeIn">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Status Distribution</h3>
            <div className="h-72 w-full">
              {statusPieData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs font-medium">
                  No complaint data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusPieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      innerRadius={50}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {statusPieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                    />
                    <Legend wrapperStyle={{ color: '#475569', fontSize: '11px', fontWeight: 500 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Line Chart: Complaints Over Time */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs animate-fadeIn">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Complaint Volume Trend</h3>
          <div className="h-64 w-full">
            {lineData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs font-medium">
                No trend data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#059669" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
