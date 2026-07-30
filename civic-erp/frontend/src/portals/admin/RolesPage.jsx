import { useEffect, useState } from 'react';
import Topbar from '../../components/Topbar';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import useOrgStore from '../../store/orgStore';
import api from '../../lib/api';
import { Shield, Plus } from 'lucide-react';

const columns = [
  { key: 'id', label: 'ID', render: (val) => <span className="font-mono font-bold text-blue-600">#{val}</span> },
  {
    key: 'name',
    label: 'Role Name',
    render: (val) => (
      <div className="flex items-center gap-2 font-bold text-slate-900 capitalize">
        <Shield className="w-4 h-4 text-blue-600" />
        <span>{val?.replace('_', ' ')}</span>
      </div>
    ),
  },
  {
    key: 'permissions',
    label: 'Permissions',
    render: (val) => (
      <div className="flex flex-wrap gap-1">
        {Array.isArray(val) && val.length > 0 ? (
          val.map((p, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 font-mono border border-slate-200"
            >
              {p}
            </span>
          ))
        ) : (
          <span className="text-slate-400 text-xs">None</span>
        )}
      </div>
    ),
  },
];

export default function RolesPage() {
  const { roles, fetchRoles } = useOrgStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', permissionsStr: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const perms = form.permissionsStr
        ? form.permissionsStr.split(',').map((p) => p.trim()).filter(Boolean)
        : [];
      await api.post('/roles/', {
        name: form.name,
        permissions: perms,
      });
      setModalOpen(false);
      setForm({ name: '', permissionsStr: '' });
      fetchRoles();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create role');
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <>
      <Topbar title="Roles & Access Control" subtitle="Manage system roles and capability permissions">
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4" /> Add Role
        </Button>
      </Topbar>

      <div className="p-6">
        <DataTable columns={columns} data={roles} />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Custom Role">
        <form onSubmit={handleSubmit} className="space-y-4 text-slate-800">
          <div>
            <label className="label-text">Role Identifier *</label>
            <input
              className="input-field"
              value={form.name}
              onChange={updateField('name')}
              placeholder="e.g. auditor"
              required
            />
          </div>
          <div>
            <label className="label-text">Permissions (comma-separated)</label>
            <input
              className="input-field"
              value={form.permissionsStr}
              onChange={updateField('permissionsStr')}
              placeholder="e.g. org:read, dept:read, user:read"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Separate permission codes with commas. Use * for full access.
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Role'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
