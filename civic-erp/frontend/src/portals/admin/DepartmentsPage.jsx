import { useEffect, useState } from 'react';
import Topbar from '../../components/Topbar';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import useOrgStore from '../../store/orgStore';
import useAuthStore from '../../store/authStore';
import api from '../../lib/api';

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  {
    key: 'icon',
    label: 'Icon',
    render: (val) => <span className="text-lg">{val || '—'}</span>,
  },
  {
    key: 'color',
    label: 'Color',
    render: (val) =>
      val ? (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 rounded" style={{ backgroundColor: val }} />
          {val}
        </span>
      ) : '—',
  },
  { key: 'working_hours', label: 'Hours' },
  {
    key: 'escalation_time_minutes',
    label: 'Escalation',
    render: (val) => val ? `${val} min` : '—',
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
      <Topbar title="Departments" subtitle="Manage organizational departments">
        <Button onClick={() => setModalOpen(true)}>+ Add Department</Button>
      </Topbar>

      <div className="p-8">
        <DataTable columns={columns} data={departments} />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Department">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-text">Name *</label>
            <input className="input-field" value={form.name} onChange={updateField('name')} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text">Icon (emoji)</label>
              <input className="input-field" value={form.icon} onChange={updateField('icon')} placeholder="🏛️" />
            </div>
            <div>
              <label className="label-text">Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={form.color}
                  onChange={updateField('color')}
                  className="w-12 h-10 rounded-lg border border-surface-600 cursor-pointer bg-transparent"
                />
                <input className="input-field flex-1" value={form.color} onChange={updateField('color')} />
              </div>
            </div>
          </div>
          <div>
            <label className="label-text">Description</label>
            <textarea
              className="input-field min-h-[80px] resize-none"
              value={form.description}
              onChange={updateField('description')}
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
