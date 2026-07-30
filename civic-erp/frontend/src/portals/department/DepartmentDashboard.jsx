import { useEffect, useState } from 'react';
import Topbar from '../../components/Topbar';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import DataTable from '../../components/DataTable';
import KanbanBoard from '../../components/KanbanBoard';
import Avatar from '../../components/Avatar';
import useAuthStore from '../../store/authStore';
import api from '../../lib/api';
import { Kanban, List, UserCheck } from 'lucide-react';

export default function DepartmentDashboard() {
  const { user } = useAuthStore();
  const [department, setDepartment] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [viewMode, setViewMode] = useState('kanban');

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedOfficerId, setSelectedOfficerId] = useState('');
  const [submittingAssign, setSubmittingAssign] = useState(false);

  const fetchData = async () => {
    if (user?.department_id) {
      try {
        const [deptRes, compRes, offRes, anaRes] = await Promise.all([
          api.get(`/departments/${user.department_id}`),
          api.get('/complaints/', { params: { department_id: user.department_id } }),
          api.get('/users/', { params: { department_id: user.department_id } }),
          api.get('/analytics/summary', { params: { department_id: user.department_id } }),
        ]);

        setDepartment(deptRes.data);
        setComplaints(compRes.data);
        setAnalytics(anaRes.data);

        // Filter officers / supervisors
        const officerUsers = offRes.data.filter((u) =>
          ['officer', 'supervisor', 'department_manager'].includes(u.role?.name)
        );
        setOfficers(officerUsers);
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // 10s auto refetch
    return () => clearInterval(interval);
  }, [user?.department_id]);

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedComplaint || !selectedOfficerId) return;

    setSubmittingAssign(true);
    try {
      await api.patch(`/complaints/${selectedComplaint.id}/assign`, {
        officer_id: Number(selectedOfficerId),
      });
      setAssignModalOpen(false);
      setSelectedComplaint(null);
      setSelectedOfficerId('');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to assign officer');
    } finally {
      setSubmittingAssign(false);
    }
  };

  const openAssignModal = (complaint) => {
    setSelectedComplaint(complaint);
    setSelectedOfficerId(complaint.assigned_officer_id || '');
    setAssignModalOpen(true);
  };

  const columns = [
    { key: 'id', label: 'ID', render: (val) => <span className="font-mono font-bold text-blue-600">#{val}</span> },
    { key: 'service', label: 'Service', render: (val) => <span className="font-semibold text-slate-900">{val?.name}</span> },
    { key: 'priority', label: 'Priority', render: (val) => <PriorityBadge priority={val} /> },
    { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
    {
      key: 'citizen',
      label: 'Citizen',
      render: (val) => (
        <div className="flex items-center gap-2">
          <Avatar name={val?.name || 'Citizen'} size="xs" />
          <span className="text-slate-700 font-medium">{val?.name}</span>
        </div>
      ),
    },
    {
      key: 'officer',
      label: 'Assigned Officer',
      render: (val) =>
        val ? (
          <div className="flex items-center gap-2">
            <Avatar name={val.name} size="xs" />
            <span className="text-slate-800 font-semibold">{val.name}</span>
          </div>
        ) : (
          <span className="text-slate-400 italic">Unassigned</span>
        ),
    },
    { key: 'created_at', label: 'Reported Date', render: (val) => new Date(val).toLocaleDateString() },
    {
      key: 'actions',
      label: 'Action',
      render: (_, row) => (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            openAssignModal(row);
          }}
          variant="secondary"
          className="text-xs py-1 px-2.5"
        >
          {row.assigned_officer_id ? 'Reassign' : 'Assign Officer'}
        </Button>
      ),
    },
  ];

  return (
    <>
      <Topbar
        title={department?.name || 'Department Operations'}
        subtitle="Live department complaint management & officer assignment"
      />

      <div className="p-6 space-y-6">
        {/* KPI Stage Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 text-center border-t-4 border-t-blue-500 shadow-2xs">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Reported</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{analytics?.status_counts?.reported || 0}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 text-center border-t-4 border-t-indigo-500 shadow-2xs">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Verified</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{analytics?.status_counts?.verified || 0}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 text-center border-t-4 border-t-purple-500 shadow-2xs">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Assigned</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{analytics?.status_counts?.assigned || 0}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 text-center border-t-4 border-t-amber-500 shadow-2xs">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">In Progress</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{analytics?.status_counts?.in_progress || 0}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 text-center border-t-4 border-t-emerald-500 shadow-2xs">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Completed</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{analytics?.status_counts?.completed || 0}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 text-center border-t-4 border-t-teal-500 shadow-2xs">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Citizen Ver.</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{analytics?.status_counts?.citizen_verified || 0}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 text-center border-t-4 border-t-slate-400 shadow-2xs">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Closed</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{analytics?.status_counts?.closed || 0}</p>
          </div>
        </div>

        {/* Header & View Switcher */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Department Queue</h2>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                viewMode === 'kanban'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" /> Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" /> List
            </button>
          </div>
        </div>

        {/* Board or Table View */}
        {viewMode === 'kanban' ? (
          <KanbanBoard
            complaints={complaints}
            onSelectComplaint={(c) => openAssignModal(c)}
            onAssignOfficer={(c) => openAssignModal(c)}
          />
        ) : (
          <DataTable columns={columns} data={complaints} />
        )}
      </div>

      {/* Assign Officer Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title={`Assign Officer — Complaint #${selectedComplaint?.id}`}
      >
        {selectedComplaint && (
          <form onSubmit={handleAssignSubmit} className="space-y-4 text-slate-800">
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-1.5 text-xs">
              <p><strong className="text-slate-900">Service:</strong> {selectedComplaint.service?.name}</p>
              <p><strong className="text-slate-900">Description:</strong> {selectedComplaint.description}</p>
              <p><strong className="text-slate-900">Location:</strong> {selectedComplaint.location?.name}</p>
            </div>

            <div>
              <label className="label-text">Select Field Officer *</label>
              <select
                className="select-field"
                value={selectedOfficerId}
                onChange={(e) => setSelectedOfficerId(e.target.value)}
                required
              >
                <option value="">-- Select Officer --</option>
                {officers.map((off) => (
                  <option key={off.id} value={off.id}>
                    {off.name} ({off.role?.name?.replace('_', ' ')})
                  </option>
                ))}
              </select>
              {officers.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  No officer accounts assigned to this department yet.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button variant="secondary" type="button" onClick={() => setAssignModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submittingAssign || !selectedOfficerId}>
                <UserCheck className="w-4 h-4" />
                {submittingAssign ? 'Assigning...' : 'Assign & Notify Officer'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
