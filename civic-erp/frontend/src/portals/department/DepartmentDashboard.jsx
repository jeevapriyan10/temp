import { useEffect, useState } from 'react';
import Topbar from '../../components/Topbar';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import DataTable from '../../components/DataTable';
import useAuthStore from '../../store/authStore';
import api from '../../lib/api';

export default function DepartmentDashboard() {
  const { user } = useAuthStore();
  const [department, setDepartment] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [analytics, setAnalytics] = useState(null);

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

  const columns = [
    { key: 'id', label: 'ID', render: (val) => <span className="font-mono font-bold text-civic-400">#{val}</span> },
    { key: 'service', label: 'Service', render: (val) => <span className="font-semibold text-white">{val?.name}</span> },
    { key: 'priority', label: 'Priority', render: (val) => <PriorityBadge priority={val} /> },
    { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
    { key: 'citizen', label: 'Citizen', render: (val) => <span className="text-surface-300">{val?.name}</span> },
    { key: 'officer', label: 'Assigned Officer', render: (val) => val ? <span className="text-emerald-400 font-medium">{val.name}</span> : <span className="text-surface-500 italic">Unassigned</span> },
    { key: 'created_at', label: 'Reported Date', render: (val) => new Date(val).toLocaleDateString() },
    {
      key: 'actions',
      label: 'Action',
      render: (_, row) => (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedComplaint(row);
            setSelectedOfficerId(row.assigned_officer_id || '');
            setAssignModalOpen(true);
          }}
          variant="secondary"
          className="text-xs py-1 px-3"
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

      <div className="p-8 space-y-8">
        {/* Live Complaint Status Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="glass-card p-4 text-center border-l-2 border-blue-500">
            <p className="text-xs text-surface-400 font-medium">Reported</p>
            <p className="text-xl font-bold text-white mt-1">{analytics?.status_counts?.reported || 0}</p>
          </div>
          <div className="glass-card p-4 text-center border-l-2 border-purple-500">
            <p className="text-xs text-surface-400 font-medium">Verified</p>
            <p className="text-xl font-bold text-white mt-1">{analytics?.status_counts?.verified || 0}</p>
          </div>
          <div className="glass-card p-4 text-center border-l-2 border-amber-500">
            <p className="text-xs text-surface-400 font-medium">Assigned</p>
            <p className="text-xl font-bold text-white mt-1">{analytics?.status_counts?.assigned || 0}</p>
          </div>
          <div className="glass-card p-4 text-center border-l-2 border-orange-500">
            <p className="text-xs text-surface-400 font-medium">In Progress</p>
            <p className="text-xl font-bold text-white mt-1">{analytics?.status_counts?.in_progress || 0}</p>
          </div>
          <div className="glass-card p-4 text-center border-l-2 border-emerald-500">
            <p className="text-xs text-surface-400 font-medium">Completed</p>
            <p className="text-xl font-bold text-white mt-1">{analytics?.status_counts?.completed || 0}</p>
          </div>
          <div className="glass-card p-4 text-center border-l-2 border-teal-500">
            <p className="text-xs text-surface-400 font-medium">Citizen Ver.</p>
            <p className="text-xl font-bold text-white mt-1">{analytics?.status_counts?.citizen_verified || 0}</p>
          </div>
          <div className="glass-card p-4 text-center border-l-2 border-surface-600">
            <p className="text-xs text-surface-400 font-medium">Closed</p>
            <p className="text-xl font-bold text-white mt-1">{analytics?.status_counts?.closed || 0}</p>
          </div>
        </div>

        {/* My Department Complaints Table */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Department Complaints Queue</h2>
            <span className="text-xs text-surface-400">Total: {complaints.length} issues</span>
          </div>

          <DataTable columns={columns} data={complaints} />
        </div>
      </div>

      {/* Assign Officer Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title={`Assign Officer — Complaint #${selectedComplaint?.id}`}
      >
        {selectedComplaint && (
          <form onSubmit={handleAssignSubmit} className="space-y-4">
            <div className="bg-surface-900/60 p-3 rounded-xl space-y-1 text-xs">
              <p><strong className="text-white">Service:</strong> {selectedComplaint.service?.name}</p>
              <p><strong className="text-white">Description:</strong> {selectedComplaint.description}</p>
              <p><strong className="text-white">Location:</strong> {selectedComplaint.location?.name}</p>
            </div>

            <div>
              <label className="label-text">Select Field Officer *</label>
              <select
                className="input-field"
                value={selectedOfficerId}
                onChange={(e) => setSelectedOfficerId(e.target.value)}
                required
              >
                <option value="">-- Select Officer --</option>
                {officers.map((off) => (
                  <option key={off.id} value={off.id}>
                    👤 {off.name} ({off.role?.name?.replace('_', ' ')})
                  </option>
                ))}
              </select>
              {officers.length === 0 && (
                <p className="text-xs text-amber-400 mt-1">
                  No officer accounts assigned to this department yet.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-surface-700/50">
              <Button variant="secondary" type="button" onClick={() => setAssignModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submittingAssign || !selectedOfficerId}>
                {submittingAssign ? 'Assigning...' : 'Assign & Notify Officer'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
