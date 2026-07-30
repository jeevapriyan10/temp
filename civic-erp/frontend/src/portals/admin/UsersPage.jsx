import { useEffect, useState } from 'react';
import Topbar from '../../components/Topbar';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import Avatar from '../../components/Avatar';
import useOrgStore from '../../store/orgStore';
import useAuthStore from '../../store/authStore';
import api from '../../lib/api';
import { UserPlus } from 'lucide-react';

const columns = [
  { key: 'id', label: 'ID', render: (val) => <span className="font-mono font-bold text-blue-600">#{val}</span> },
  {
    key: 'name',
    label: 'User Name',
    render: (val, row) => (
      <div className="flex items-center gap-2.5">
        <Avatar name={val || 'User'} size="sm" />
        <div>
          <p className="font-bold text-slate-900 leading-none">{val}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">{row.phone || 'No phone'}</p>
        </div>
      </div>
    ),
  },
  { key: 'email', label: 'Email Address', render: (val) => <span className="text-slate-600 font-medium">{val}</span> },
  {
    key: 'role',
    label: 'Role',
    render: (val) => (
      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 capitalize">
        {val?.name?.replace('_', ' ') || '—'}
      </span>
    ),
  },
  {
    key: 'is_active',
    label: 'Status',
    render: (val) => (
      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${val ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
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
      <Topbar title="Users" subtitle="Manage organization staff, field officers, and citizens">
        <Button onClick={() => setModalOpen(true)}>
          <UserPlus className="w-4 h-4" /> Add User
        </Button>
      </Topbar>

      <div className="p-6">
        <DataTable columns={columns} data={users} />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add User Account">
        <form onSubmit={handleSubmit} className="space-y-4 text-slate-800">
          <div>
            <label className="label-text">Full Name *</label>
            <input className="input-field" value={form.name} onChange={updateField('name')} required placeholder="e.g. Officer Jane Smith" />
          </div>
          <div>
            <label className="label-text">Email Address *</label>
            <input type="email" className="input-field" value={form.email} onChange={updateField('email')} required placeholder="officer@city.gov" />
          </div>
          <div>
            <label className="label-text">Password *</label>
            <input type="password" className="input-field" value={form.password} onChange={updateField('password')} required placeholder="••••••••" />
          </div>
          <div>
            <label className="label-text">Phone Number</label>
            <input className="input-field" value={form.phone} onChange={updateField('phone')} placeholder="+1 (555) 000-0000" />
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
            <label className="label-text">Department (Optional)</label>
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
