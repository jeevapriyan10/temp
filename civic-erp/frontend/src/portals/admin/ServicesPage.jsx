import { useEffect, useState } from 'react';
import Topbar from '../../components/Topbar';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import PriorityBadge from '../../components/PriorityBadge';
import useOrgStore from '../../store/orgStore';
import api from '../../lib/api';
import { Settings, Plus } from 'lucide-react';

const columns = [
  { key: 'id', label: 'ID', render: (val) => <span className="font-mono font-bold text-blue-600">#{val}</span> },
  {
    key: 'name',
    label: 'Service Name',
    render: (val) => (
      <div className="flex items-center gap-2 font-bold text-slate-900">
        <Settings className="w-4 h-4 text-blue-600" />
        <span>{val}</span>
      </div>
    ),
  },
  { key: 'description', label: 'Description', render: (v) => <span className="text-slate-600">{v || '—'}</span> },
  {
    key: 'default_priority',
    label: 'Default Priority',
    render: (val) => <PriorityBadge priority={val} />,
  },
  { key: 'department_id', label: 'Dept ID', render: (val) => <span className="font-mono text-xs text-slate-500">Dept #{val}</span> },
];

export default function ServicesPage() {
  const { services, departments, fetchServices, fetchDepartments } = useOrgStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ department_id: '', name: '', description: '', default_priority: 'medium' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchServices();
    fetchDepartments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/services/', {
        ...form,
        department_id: parseInt(form.department_id),
      });
      setModalOpen(false);
      setForm({ department_id: '', name: '', description: '', default_priority: 'medium' });
      fetchServices();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create service');
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <>
      <Topbar title="Services" subtitle="Manage catalog of municipal services and default priority rules">
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4" /> Add Service
        </Button>
      </Topbar>

      <div className="p-6">
        <DataTable columns={columns} data={services} />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add New Service">
        <form onSubmit={handleSubmit} className="space-y-4 text-slate-800">
          <div>
            <label className="label-text">Department *</label>
            <select className="select-field" value={form.department_id} onChange={updateField('department_id')} required>
              <option value="">Select department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-text">Service Name *</label>
            <input className="input-field" value={form.name} onChange={updateField('name')} required placeholder="e.g. Water Leak Repair" />
          </div>
          <div>
            <label className="label-text">Description</label>
            <textarea className="input-field min-h-[80px] resize-none" value={form.description} onChange={updateField('description')} placeholder="Detailed service scope..." />
          </div>
          <div>
            <label className="label-text">Default Priority</label>
            <select className="select-field" value={form.default_priority} onChange={updateField('default_priority')}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Service'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
