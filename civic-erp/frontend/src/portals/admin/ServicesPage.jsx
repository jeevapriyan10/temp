import { useEffect, useState } from 'react';
import Topbar from '../../components/Topbar';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import useOrgStore from '../../store/orgStore';
import api from '../../lib/api';

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'description', label: 'Description', render: (v) => v || '—' },
  {
    key: 'default_priority',
    label: 'Priority',
    render: (val) => {
      const colors = {
        low: 'bg-green-500/10 text-green-400',
        medium: 'bg-amber-500/10 text-amber-400',
        high: 'bg-orange-500/10 text-orange-400',
        critical: 'bg-red-500/10 text-red-400',
      };
      return (
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${colors[val] || colors.medium}`}>
          {val}
        </span>
      );
    },
  },
  { key: 'department_id', label: 'Dept ID' },
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
      <Topbar title="Services" subtitle="Manage department services">
        <Button onClick={() => setModalOpen(true)}>+ Add Service</Button>
      </Topbar>

      <div className="p-8">
        <DataTable columns={columns} data={services} />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Service">
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label className="label-text">Name *</label>
            <input className="input-field" value={form.name} onChange={updateField('name')} required />
          </div>
          <div>
            <label className="label-text">Description</label>
            <textarea className="input-field min-h-[80px] resize-none" value={form.description} onChange={updateField('description')} />
          </div>
          <div>
            <label className="label-text">Priority</label>
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
