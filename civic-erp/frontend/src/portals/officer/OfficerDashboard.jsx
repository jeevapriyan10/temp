import { useEffect, useState } from 'react';
import Topbar from '../../components/Topbar';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import useAuthStore from '../../store/authStore';
import api from '../../lib/api';

export default function OfficerDashboard() {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [statusNote, setStatusNote] = useState('');
  const [completionPhoto, setCompletionPhoto] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchTasks = async () => {
    if (user?.id) {
      try {
        const { data } = await api.get('/complaints/', {
          params: { officer_id: user.id },
        });
        setTasks(data);
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 10000); // 10s auto refetch
    return () => clearInterval(interval);
  }, [user?.id]);

  const handleUpdateStatus = async (complaintId, newStatus) => {
    setUpdating(true);
    try {
      await api.patch(`/complaints/${complaintId}/status`, {
        status: newStatus,
        note: statusNote || `Status moved to ${newStatus} by officer`,
      });
      setActiveTask(null);
      setStatusNote('');
      setCompletionPhoto('');
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update task status');
    } finally {
      setUpdating(false);
    }
  };

  const activeTasks = tasks.filter((t) => ['assigned', 'in_progress'].includes(t.status));
  const completedTasks = tasks.filter((t) => ['completed', 'citizen_verified', 'closed'].includes(t.status));

  return (
    <>
      <Topbar title="Officer Dashboard" subtitle={`Welcome, Officer ${user?.name}`} />

      <div className="p-8 space-y-8">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="glass-card p-5 border-l-4 border-amber-500">
            <p className="text-xs text-surface-400 font-medium uppercase">Pending Assigned</p>
            <p className="text-2xl font-bold text-white mt-1">
              {tasks.filter((t) => t.status === 'assigned').length}
            </p>
          </div>
          <div className="glass-card p-5 border-l-4 border-orange-500">
            <p className="text-xs text-surface-400 font-medium uppercase">Work In Progress</p>
            <p className="text-2xl font-bold text-white mt-1">
              {tasks.filter((t) => t.status === 'in_progress').length}
            </p>
          </div>
          <div className="glass-card p-5 border-l-4 border-emerald-500">
            <p className="text-xs text-surface-400 font-medium uppercase">Resolved Today</p>
            <p className="text-2xl font-bold text-white mt-1">{completedTasks.length}</p>
          </div>
        </div>

        {/* Today's Active Tasks */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Today's Assigned Tasks</h2>

          {activeTasks.length === 0 ? (
            <div className="glass-card p-12 text-center animate-fadeIn">
              <div className="text-4xl mb-3">🎉</div>
              <h3 className="text-lg font-semibold text-white mb-1">No active tasks pending</h3>
              <p className="text-surface-400 text-sm">
                You have completed all assigned tasks or none are currently assigned.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {activeTasks.map((t) => (
                <div key={t.id} className="glass-card p-6 flex flex-col justify-between space-y-4 animate-fadeIn">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-civic-400">#{t.id}</span>
                      <div className="flex gap-1.5">
                        <StatusBadge status={t.status} />
                        <PriorityBadge priority={t.priority} />
                      </div>
                    </div>
                    <h3 className="font-bold text-white text-base">{t.service?.name}</h3>
                    <p className="text-xs text-surface-300 line-clamp-3 bg-surface-900/50 p-2.5 rounded-lg">
                      {t.description}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-surface-400 pt-1">
                      <span>📍 {t.location?.name}</span>
                      <span>👤 {t.citizen?.name}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-surface-700/50">
                    {t.status === 'assigned' && (
                      <Button
                        onClick={() => handleUpdateStatus(t.id, 'in_progress')}
                        disabled={updating}
                        className="w-full text-xs py-2 bg-orange-600 hover:bg-orange-500"
                      >
                        ⚡ Start Work (In Progress)
                      </Button>
                    )}

                    {t.status === 'in_progress' && (
                      <Button
                        onClick={() => setActiveTask(t)}
                        className="w-full text-xs py-2 bg-emerald-600 hover:bg-emerald-500"
                      >
                        ✓ Mark Completed
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resolved / Completed Tasks section */}
        {completedTasks.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Recently Completed Tasks</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {completedTasks.map((t) => (
                <div key={t.id} className="glass-card p-4 space-y-2 opacity-80 hover:opacity-100 transition-opacity">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-civic-400">#{t.id}</span>
                    <StatusBadge status={t.status} />
                  </div>
                  <h4 className="text-sm font-semibold text-white truncate">{t.service?.name}</h4>
                  <p className="text-xs text-surface-400 line-clamp-2">{t.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Completion Modal with Notes */}
      <Modal
        isOpen={!!activeTask}
        onClose={() => setActiveTask(null)}
        title={`Complete Task #${activeTask?.id}`}
      >
        {activeTask && (
          <div className="space-y-4">
            <p className="text-xs text-surface-300">
              Provide work details or notes before resolving <strong>{activeTask.service?.name}</strong>.
            </p>

            <div>
              <label className="label-text">Resolution Notes / Action Taken *</label>
              <textarea
                className="input-field h-24 resize-none"
                placeholder="e.g. Repaired broken pipe, replaced gasket and tested water pressure..."
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setActiveTask(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => handleUpdateStatus(activeTask.id, 'completed')}
                disabled={updating || !statusNote.trim()}
              >
                {updating ? 'Updating...' : 'Submit Resolution'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
