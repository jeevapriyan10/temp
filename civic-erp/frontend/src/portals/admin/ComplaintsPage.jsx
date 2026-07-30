import { useEffect, useState } from 'react';
import Topbar from '../../components/Topbar';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import Modal from '../../components/Modal';
import DataTable from '../../components/DataTable';
import useAuthStore from '../../store/authStore';
import api from '../../lib/api';

export default function ComplaintsPage() {
  const { user } = useAuthStore();
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const fetchComplaints = async () => {
    if (user?.org_id) {
      try {
        const params = { org_id: user.org_id };
        if (selectedDept) params.department_id = selectedDept;
        if (selectedStatus) params.status = selectedStatus;
        if (selectedPriority) params.priority = selectedPriority;

        const { data } = await api.get('/complaints/', { params });
        setComplaints(data);
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    if (user?.org_id) {
      api.get('/departments/', { params: { org_id: user.org_id } }).then(({ data }) => setDepartments(data));
    }
  }, [user?.org_id]);

  useEffect(() => {
    fetchComplaints();
  }, [user?.org_id, selectedDept, selectedStatus, selectedPriority]);

  const columns = [
    { key: 'id', label: 'ID', render: (val) => <span className="font-mono font-bold text-civic-400">#{val}</span> },
    { key: 'service', label: 'Service', render: (val) => <span className="font-semibold text-white">{val?.name}</span> },
    { key: 'department', label: 'Department', render: (val) => <span className="text-surface-300">{val?.name}</span> },
    { key: 'priority', label: 'Priority', render: (val) => <PriorityBadge priority={val} /> },
    { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
    { key: 'citizen', label: 'Citizen', render: (val) => <span className="text-surface-300">{val?.name}</span> },
    { key: 'officer', label: 'Assigned Officer', render: (val) => val ? <span className="text-emerald-400 font-medium">{val.name}</span> : <span className="text-surface-500 italic">Unassigned</span> },
    { key: 'created_at', label: 'Created At', render: (val) => new Date(val).toLocaleDateString() },
  ];

  return (
    <>
      <Topbar title="Global Complaints Register" subtitle="Organization-wide complaint management and audit trail" />

      <div className="p-8 space-y-6">
        {/* Filters */}
        <div className="glass-card p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label-text">Filter by Department</label>
            <select
              className="input-field"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label-text">Filter by Status</label>
            <select
              className="input-field"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="reported">Reported</option>
              <option value="verified">Verified</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="citizen_verified">Citizen Verified</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div>
            <label className="label-text">Filter by Priority</label>
            <select
              className="input-field"
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        {/* Complaints Table */}
        <DataTable
          columns={columns}
          data={complaints}
          onRowClick={(row) => setSelectedComplaint(row)}
        />
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        title={`Complaint #${selectedComplaint?.id} Master Audit Record`}
      >
        {selectedComplaint && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-surface-700/50 pb-4">
              <div>
                <h3 className="font-bold text-white text-lg">{selectedComplaint.service?.name}</h3>
                <p className="text-xs text-surface-400">Department: {selectedComplaint.department?.name}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <StatusBadge status={selectedComplaint.status} />
                <PriorityBadge priority={selectedComplaint.priority} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-surface-900/40 p-3 rounded-xl">
              <div>
                <span className="text-surface-500">Citizen:</span>
                <p className="font-semibold text-surface-200">{selectedComplaint.citizen?.name}</p>
              </div>
              <div>
                <span className="text-surface-500">Assigned Officer:</span>
                <p className="font-semibold text-surface-200">{selectedComplaint.officer?.name || 'Unassigned'}</p>
              </div>
              <div>
                <span className="text-surface-500">Location:</span>
                <p className="font-semibold text-surface-200">{selectedComplaint.location?.name}</p>
              </div>
              <div>
                <span className="text-surface-500">Reported On:</span>
                <p className="font-semibold text-surface-200">{new Date(selectedComplaint.created_at).toLocaleString()}</p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-1">Description</h4>
              <p className="text-sm text-surface-200 bg-surface-900/60 p-3 rounded-xl">{selectedComplaint.description}</p>
            </div>

            {selectedComplaint.photo_url && (
              <div>
                <h4 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">Photo Evidence</h4>
                <div className="w-full h-48 rounded-xl overflow-hidden border border-surface-700 bg-black">
                  <img src={selectedComplaint.photo_url} alt="Evidence" className="w-full h-full object-contain" />
                </div>
              </div>
            )}

            <div>
              <h4 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3">Complete Audit History</h4>
              <div className="relative pl-4 space-y-4 border-l-2 border-surface-700">
                {selectedComplaint.history?.map((h) => (
                  <div key={h.id} className="relative">
                    <div className="absolute -left-[21px] top-0.5 w-3 h-3 rounded-full bg-civic-500 border-2 border-surface-800" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white capitalize">{h.status.replace('_', ' ')}</span>
                      <span className="text-surface-500">{new Date(h.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-surface-400 mt-0.5">{h.note}</p>
                    <p className="text-[10px] text-surface-500">User: {h.changed_by?.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
