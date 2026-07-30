import { useEffect, useState } from 'react';
import Topbar from '../../components/Topbar';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import Modal from '../../components/Modal';
import DataTable from '../../components/DataTable';
import KanbanBoard from '../../components/KanbanBoard';
import Avatar from '../../components/Avatar';
import useAuthStore from '../../store/authStore';
import api from '../../lib/api';
import { Kanban, List, Filter, SlidersHorizontal } from 'lucide-react';

export default function ComplaintsPage() {
  const { user } = useAuthStore();
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'

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
    { key: 'id', label: 'ID', render: (val) => <span className="font-mono font-bold text-blue-600">#{val}</span> },
    { key: 'service', label: 'Service', render: (val) => <span className="font-semibold text-slate-900">{val?.name}</span> },
    { key: 'department', label: 'Department', render: (val) => <span className="text-slate-600">{val?.name}</span> },
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
            <span className="text-slate-800 font-medium">{val.name}</span>
          </div>
        ) : (
          <span className="text-slate-400 italic">Unassigned</span>
        ),
    },
    { key: 'created_at', label: 'Created At', render: (val) => new Date(val).toLocaleDateString() },
  ];

  return (
    <>
      <Topbar title="Global Complaints Register" subtitle="Organization-wide complaint management and stage tracking" />

      <div className="p-6 space-y-6">
        {/* Controls & Filter Bar matching reference */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider pr-2 border-r border-slate-200">
              <SlidersHorizontal className="w-4 h-4 text-slate-400" />
              <span>Filters</span>
            </div>

            {/* Department Filter */}
            <select
              className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 px-3 py-2 focus:bg-white focus:outline-none"
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

            {/* Status Filter */}
            <select
              className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 px-3 py-2 focus:bg-white focus:outline-none"
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

            {/* Priority Filter */}
            <select
              className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 px-3 py-2 focus:bg-white focus:outline-none"
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

          {/* View Switcher: Kanban vs List */}
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

        {/* Board or Table view */}
        {viewMode === 'kanban' ? (
          <KanbanBoard
            complaints={complaints}
            onSelectComplaint={(c) => setSelectedComplaint(c)}
          />
        ) : (
          <DataTable
            columns={columns}
            data={complaints}
            onRowClick={(row) => setSelectedComplaint(row)}
          />
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        title={`Complaint #${selectedComplaint?.id} Master Audit Record`}
      >
        {selectedComplaint && (
          <div className="space-y-5 text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{selectedComplaint.service?.name}</h3>
                <p className="text-xs text-slate-500">Department: {selectedComplaint.department?.name}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <StatusBadge status={selectedComplaint.status} />
                <PriorityBadge priority={selectedComplaint.priority} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <div className="flex items-center gap-2">
                <Avatar name={selectedComplaint.citizen?.name || 'Citizen'} size="sm" />
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Citizen</span>
                  <p className="font-semibold text-slate-800">{selectedComplaint.citizen?.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Avatar name={selectedComplaint.officer?.name || 'Unassigned'} size="sm" />
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Officer</span>
                  <p className="font-semibold text-slate-800">{selectedComplaint.officer?.name || 'Unassigned'}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Description</h4>
              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/60 leading-relaxed">
                {selectedComplaint.description}
              </p>
            </div>

            {selectedComplaint.photo_url && (
              <div>
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Photo Evidence</h4>
                <div className="w-full h-48 rounded-xl overflow-hidden border border-slate-200 bg-slate-900 flex items-center justify-center">
                  <img src={selectedComplaint.photo_url} alt="Evidence" className="max-h-full object-contain" />
                </div>
              </div>
            )}

            <div>
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Audit Timeline</h4>
              <div className="relative pl-4 space-y-4 border-l-2 border-slate-200">
                {selectedComplaint.history?.map((h) => (
                  <div key={h.id} className="relative">
                    <div className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full bg-blue-600 border-2 border-white ring-2 ring-blue-100" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 capitalize">{h.status.replace('_', ' ')}</span>
                      <span className="text-[10px] text-slate-400">{new Date(h.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{h.note}</p>
                    <p className="text-[10px] font-medium text-slate-400">By: {h.changed_by?.name}</p>
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
