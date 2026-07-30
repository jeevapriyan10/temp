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
  { key: 'email', label: 'Email' },
  {
    key: 'role',
    label: 'Role',
    render: (val) => (
      <span className="px-2 py-1 rounded-md text-xs font-medium bg-civic-500/10 text-civic-400">
        {val?.name?.replace('_', ' ') || '—'}
      </span>
    ),
  },
  {
    key: 'is_active',
    label: 'Status',
    render: (val) => (
      <span className={`px-2 py-1 rounded-md text-xs font-medium ${val ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
        {val ? 'Active' : 'Inactive'}
      </span>
    ),
  },
];

export default function UsersPage() {
  const { users, departments, fetchUsers, fetchDepartments } = useOrgStore();
  const { user } = useAuthStore();
  const orgId = user?.org_id;
  const [modalOpen, setModalOpen] = useState(false);
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', role_id: '', department_id: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (orgId) {
      fetchUsers(orgId);
      fetchDepartments(orgId);
    }
    api.get('/roles/').then(({ data }) => {
      setRoles(data);
    }).catch(() => {});
  }, [orgId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/users/', {
        ...form,
        org_id: orgId,
        role_id: parseInt(form.role_id),
        department_id: form.department_id ? parseInt(form.department_id) : null,
      });
      setModalOpen(false);
      setForm({ name: '', email: '', password: '', phone: '', role_id: '', department_id: '' });
      fetchUsers(orgId);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <>
      <Topbar title="Users" subtitle="Manage user accounts and roles">
        <Button onClick={() => setModalOpen(true)}>+ Add User</Button>
      </Topbar>

      <div className="p-8">
        <DataTable columns={columns} data={users} />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add User">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-text">Name *</label>
            <input className="input-field" value={form.name} onChange={updateField('name')} required />
          </div>
          <div>
            <label className="label-text">Email *</label>
            <input type="email" className="input-field" value={form.email} onChange={updateField('email')} required />
          </div>
          <div>
            <label className="label-text">Password *</label>
            <input type="password" className="input-field" value={form.password} onChange={updateField('password')} required />
          </div>
          <div>
            <label className="label-text">Phone</label>
            <input className="input-field" value={form.phone} onChange={updateField('phone')} />
          </div>
          <div>
            <label className="label-text">Role *</label>
            <select className="select-field" value={form.role_id} onChange={updateField('role_id')} required>
              <option value="">Select role</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.name.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-text">Department</label>
            <select className="select-field" value={form.department_id} onChange={updateField('department_id')}>
              <option value="">No department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
