import { useEffect, useState } from 'react';
import Topbar from '../../components/Topbar';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import useAuthStore from '../../store/authStore';
import api from '../../lib/api';
import { Package, Plus, Edit2, Trash2 } from 'lucide-react';

export default function InventoryPage() {
  const { user } = useAuthStore();
  const [items, setItems] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ name: '', quantity: 0, unit: 'units' });
  const [submitting, setSubmitting] = useState(false);

  const fetchInventory = async () => {
    try {
      const { data } = await api.get('/inventory/', {
        params: { department_id: user?.department_id },
      });
      setItems(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user?.department_id) {
      fetchInventory();
    }
  }, [user?.department_id]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setForm({ name: '', quantity: 0, unit: 'units' });
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setForm({ name: item.name, quantity: item.quantity, unit: item.unit });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this inventory item?')) return;
    try {
      await api.delete(`/inventory/${id}`);
      fetchInventory();
    } catch (err) {
      alert('Failed to delete inventory item');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingItem) {
        await api.put(`/inventory/${editingItem.id}`, form);
      } else {
        await api.post('/inventory/', {
          ...form,
          department_id: user.department_id,
        });
      }
      setModalOpen(false);
      fetchInventory();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to save inventory item');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: 'id', label: 'ID', render: (val) => <span className="font-mono font-bold text-blue-600">#{val}</span> },
    {
      key: 'name',
      label: 'Item Name',
      render: (val) => (
        <div className="flex items-center gap-2 font-bold text-slate-900">
          <Package className="w-4 h-4 text-blue-600" />
          <span>{val}</span>
        </div>
      ),
    },
    {
      key: 'quantity',
      label: 'Stock Quantity',
      render: (val, row) => (
        <span className={`font-bold ${val < 10 ? 'text-red-600' : 'text-emerald-700'}`}>
          {val} {row.unit}
        </span>
      ),
    },
    { key: 'unit', label: 'Unit Type', render: (val) => <span className="text-slate-500 uppercase text-[11px] font-mono">{val}</span> },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEdit(row);
            }}
            className="text-xs py-1 px-2.5"
          >
            <Edit2 className="w-3 h-3" /> Edit
          </Button>
          <Button
            variant="danger"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row.id);
            }}
            className="text-xs py-1 px-2.5"
          >
            <Trash2 className="w-3 h-3" /> Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Topbar title="Department Inventory" subtitle="Manage operational stock & equipment supplies">
        <Button onClick={handleOpenAdd}>
          <Plus className="w-4 h-4" /> Add Stock Item
        </Button>
      </Topbar>

      <div className="p-6">
        <DataTable columns={columns} data={items} />
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? 'Edit Inventory Item' : 'Add Inventory Item'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-slate-800">
          <div>
            <label className="label-text">Item Name *</label>
            <input
              className="input-field"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Asphalt Cold Mix"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text">Quantity *</label>
              <input
                type="number"
                min="0"
                className="input-field"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                required
              />
            </div>
            <div>
              <label className="label-text">Unit *</label>
              <input
                className="input-field"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                placeholder="e.g. bags, meters, units"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : editingItem ? 'Update Item' : 'Create Item'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
