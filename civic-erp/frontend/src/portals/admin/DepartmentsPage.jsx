import { useEffect, useState } from 'react';
import Topbar from '../../components/Topbar';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import useOrgStore from '../../store/orgStore';
import useAuthStore from '../../store/authStore';
import api from '../../lib/api';
import { Building2, Plus } from 'lucide-react';

const columns = [
  { key: 'id', label: 'ID', render: (val) => <span className="font-mono font-bold text-blue-600">#{val}</span> },
  {
    key: 'name',
    label: 'Department Name',
    render: (val) => (
      <div className="flex items-center gap-2 font-bold text-slate-900">
        <Building2 className="w-4 h-4 text-blue-600" />
        <span>{val}</span>
      </div>
    ),
  },
  {
    key: 'color',
    label: 'Accent Color',
    render: (val) =>
      val ? (
        <span className="flex items-center gap-2 font-mono text-xs text-slate-600">
          <span className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs" style={{ backgroundColor: val }} />
          {val}
        </span>
      ) : (
        '—'
      ),
  },
  { key: 'working_hours', label: 'Working Hours', render: (val) => <span className="text-slate-600 font-medium">{val || 'Standard'}</span> },
  {
    key: 'escalation_time_minutes',
    label: 'Escalation Time',
    render: (val) => (val ? <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-700">{val} mins</span> : '—'),
  },
];

export default function DepartmentsPage() {
  const { departments, fetchDepartments } = useOrgStore();
  const { user } = useAuthStore();
  const orgId = user?.org_id;
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: '', icon: '', color: '#3B82F6', description: '',
    working_hours: '', escalation_time_minutes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (orgId) fetchDepartments(orgId);
  }, [orgId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/departments/', {
        ...form,
        org_id: orgId,
        escalation_time_minutes: form.escalation_time_minutes
          ? parseInt(form.escalation_time_minutes) : null,
      });
      setModalOpen(false);
      setForm({ name: '', icon: '', color: '#3B82F6', description: '', working_hours: '', escalation_time_minutes: '' });
      fetchDepartments(orgId);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create department');
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <>
      <Topbar title="Departments" subtitle="Manage organizational departments and escalation thresholds">
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4" /> Add Department
        </Button>
      </Topbar>

      <div className="p-6">
        <DataTable columns={columns} data={departments} />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add New Department">
        <form onSubmit={handleSubmit} className="space-y-4 text-slate-800">
          <div>
            <label className="label-text">Department Name *</label>
            <input className="input-field" value={form.name} onChange={updateField('name')} required placeholder="e.g. Sanitation & Waste Management" />
          </div>
          <div>
            <label className="label-text">Accent Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={form.color}
                onChange={updateField('color')}
                className="w-12 h-9 rounded-lg border border-slate-200 cursor-pointer bg-transparent"
              />
              <input className="input-field flex-1" value={form.color} onChange={updateField('color')} />
            </div>
          </div>
          <div>
            <label className="label-text">Description</label>
            <textarea
              className="input-field min-h-[80px] resize-none"
              value={form.description}
              onChange={updateField('description')}
              placeholder="Brief department responsibilities..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text">Working Hours</label>
              <input className="input-field" value={form.working_hours} onChange={updateField('working_hours')} placeholder="08:00-18:00" />
            </div>
            <div>
              <label className="label-text">Escalation (min)</label>
              <input
                type="number"
                className="input-field"
                value={form.escalation_time_minutes}
                onChange={updateField('escalation_time_minutes')}
                placeholder="120"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Department'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
