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

const COLORS = ['#3B82F6', '#8B5CF6', '#F59E0B', '#F97316', '#10B981', '#14B8A6', '#64748B'];

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
        <div className="p-8 text-center text-surface-400">Loading analytics...</div>
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

      <div className="p-8 space-y-8">
        {/* AI Executive Insights Card */}
        {insights.length > 0 && (
          <div className="glass-card p-6 border-l-4 border-civic-500 bg-gradient-to-r from-civic-500/10 via-purple-500/5 to-transparent animate-fadeIn">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">✨</span>
              <h3 className="text-base font-bold text-white">AI Executive Operations Summary</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-civic-500/20 text-civic-300 border border-civic-500/30">
                Realtime Data-Grounded
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {insights.map((text, idx) => (
                <div key={idx} className="flex items-start gap-2.5 bg-surface-900/40 p-3 rounded-xl border border-surface-700/40">
                  <span className="text-civic-400 font-bold text-xs mt-0.5">#{idx + 1}</span>
                  <p className="text-xs text-surface-200 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card
            title="Total Complaints Logged"
            value={analytics?.total_complaints || 0}
            icon="📋"
            color="civic"
          />
          <Card
            title="Avg Resolution Time"
            value={`${analytics?.avg_resolution_time_minutes || 0} mins`}
            icon="⏱️"
            color="green"
          />
          <Card
            title="Critical Priority Complaints"
            value={analytics?.priority_counts?.critical || 0}
            icon="🚨"
            color="red"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bar Chart: Complaints by Department */}
          <div className="glass-card p-6 animate-fadeIn">
            <h3 className="text-base font-semibold text-white mb-4">Complaints by Department</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptBarData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="department_name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', borderRadius: '8px' }}
                    itemStyle={{ color: '#38bdf8' }}
                  />
                  <Bar dataKey="count" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart: Status Breakdown */}
          <div className="glass-card p-6 animate-fadeIn">
            <h3 className="text-base font-semibold text-white mb-4">Status Distribution</h3>
            <div className="h-72 w-full">
              {statusPieData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-surface-400 text-sm">
                  No complaint data yet
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
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', borderRadius: '8px' }}
                    />
                    <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Line Chart: Complaints Over Time */}
        <div className="glass-card p-6 animate-fadeIn">
          <h3 className="text-base font-semibold text-white mb-4">Complaint Volume Trend</h3>
          <div className="h-64 w-full">
            {lineData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-surface-400 text-sm">
                No trend data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', borderRadius: '8px' }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
