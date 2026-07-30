import { useEffect, useState } from 'react';
import Topbar from '../../components/Topbar';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import useOrgStore from '../../store/orgStore';
import api from '../../lib/api';

const columns = [
  { key: 'id', label: 'ID' },
  {
    key: 'name',
    label: 'Role Name',
    render: (val) => (
      <span className="font-semibold text-white capitalize">
        {val?.replace('_', ' ')}
      </span>
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
              className="px-2 py-0.5 rounded text-xs bg-surface-700 text-surface-300 font-mono"
            >
              {p}
            </span>
          ))
        ) : (
          <span className="text-surface-500 text-xs">None</span>
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
      <Topbar title="Roles" subtitle="Manage system roles and permissions">
        <Button onClick={() => setModalOpen(true)}>+ Add Role</Button>
      </Topbar>

      <div className="p-8">
        <DataTable columns={columns} data={roles} />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Role">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-text">Role Name *</label>
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
            <p className="text-xs text-surface-500 mt-1">
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
