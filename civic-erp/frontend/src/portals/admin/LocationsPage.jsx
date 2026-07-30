import { useEffect, useState } from 'react';
import Topbar from '../../components/Topbar';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import useOrgStore from '../../store/orgStore';
import useAuthStore from '../../store/authStore';
import api from '../../lib/api';
import { MapPin, Plus } from 'lucide-react';

const columns = [
  { key: 'id', label: 'ID', render: (val) => <span className="font-mono font-bold text-blue-600">#{val}</span> },
  {
    key: 'name',
    label: 'Location Name',
    render: (val) => (
      <div className="flex items-center gap-2 font-bold text-slate-900">
        <MapPin className="w-4 h-4 text-blue-600" />
        <span>{val}</span>
      </div>
    ),
  },
  {
    key: 'type',
    label: 'Type',
    render: (val) => (
      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 capitalize">
        {val}
      </span>
    ),
  },
  { key: 'parent_location_id', label: 'Parent ID', render: (v) => (v ? <span className="font-mono text-xs text-slate-500">#{v}</span> : '—') },
];

export default function LocationsPage() {
  const { locations, fetchLocations } = useOrgStore();
  const { user } = useAuthStore();
  const orgId = user?.org_id;
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'zone', parent_location_id: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (orgId) fetchLocations(orgId);
  }, [orgId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/locations/', {
        ...form,
        org_id: orgId,
        parent_location_id: form.parent_location_id ? parseInt(form.parent_location_id) : null,
      });
      setModalOpen(false);
      setForm({ name: '', type: 'zone', parent_location_id: '' });
      fetchLocations(orgId);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create location');
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <>
      <Topbar title="Locations" subtitle="Manage geographic boundaries and location hierarchy">
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4" /> Add Location
        </Button>
      </Topbar>

      <div className="p-6">
        <DataTable columns={columns} data={locations} />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Location Node">
        <form onSubmit={handleSubmit} className="space-y-4 text-slate-800">
          <div>
            <label className="label-text">Location Name *</label>
            <input className="input-field" value={form.name} onChange={updateField('name')} required placeholder="e.g. Ward 5 Anna Street" />
          </div>
          <div>
            <label className="label-text">Type</label>
            <select className="select-field" value={form.type} onChange={updateField('type')}>
              {['zone', 'region', 'area', 'building', 'block', 'floor', 'room'].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-text">Parent Location</label>
            <select className="select-field" value={form.parent_location_id} onChange={updateField('parent_location_id')}>
              <option value="">None (top-level)</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>{l.name} ({l.type})</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Location'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
