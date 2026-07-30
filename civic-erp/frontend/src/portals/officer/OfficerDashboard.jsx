import { useEffect, useState } from 'react';
import Topbar from '../../components/Topbar';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import Avatar from '../../components/Avatar';
import useAuthStore from '../../store/authStore';
import api from '../../lib/api';
import { Zap, Check, MapPin, CheckCircle2, Clock } from 'lucide-react';

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
      <Topbar title="Officer Operations" subtitle={`Field Task Console — ${user?.name || 'Officer'}`} />

      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs border-l-4 border-l-amber-500">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Assigned</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {tasks.filter((t) => t.status === 'assigned').length}
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs border-l-4 border-l-orange-500">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Work In Progress</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {tasks.filter((t) => t.status === 'in_progress').length}
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs border-l-4 border-l-emerald-500">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Resolved Tasks</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{completedTasks.length}</p>
          </div>
        </div>

        {/* Today's Active Tasks */}
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight mb-4">Assigned Field Tasks</h2>

          {activeTasks.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center animate-fadeIn shadow-xs">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">No active tasks pending</h3>
              <p className="text-slate-500 text-xs">
                You have completed all assigned field tasks or none are currently queued.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeTasks.map((t) => (
                <div key={t.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4 animate-fadeIn hover:border-slate-300 transition-all">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-bold text-blue-600">#{t.id}</span>
                      <div className="flex gap-1.5">
                        <StatusBadge status={t.status} />
                        <PriorityBadge priority={t.priority} />
                      </div>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">{t.service?.name}</h3>
                    <p className="text-xs text-slate-600 line-clamp-3 bg-slate-50 p-3 rounded-lg border border-slate-200/60 leading-relaxed">
                      {t.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 truncate max-w-[180px]">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{t.location?.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Avatar name={t.citizen?.name || 'Citizen'} size="xs" />
                        <span className="font-semibold text-slate-700">{t.citizen?.name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    {t.status === 'assigned' && (
                      <Button
                        onClick={() => handleUpdateStatus(t.id, 'in_progress')}
                        disabled={updating}
                        className="w-full text-xs py-2 bg-orange-600 hover:bg-orange-700 text-white"
                      >
                        <Zap className="w-3.5 h-3.5" /> Start Work (In Progress)
                      </Button>
                    )}

                    {t.status === 'in_progress' && (
                      <Button
                        onClick={() => setActiveTask(t)}
                        className="w-full text-xs py-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <Check className="w-3.5 h-3.5" /> Mark Completed
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
            <h2 className="text-base font-bold text-slate-900 tracking-tight mb-4">Recently Resolved Tasks</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {completedTasks.map((t) => (
                <div key={t.id} className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-blue-600">#{t.id}</span>
                    <StatusBadge status={t.status} />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 truncate">{t.service?.name}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2">{t.description}</p>
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
          <div className="space-y-4 text-slate-800">
            <p className="text-xs text-slate-600">
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

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
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
