import { useEffect, useState } from 'react';
import Topbar from '../../components/Topbar';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import Avatar from '../../components/Avatar';
import useAuthStore from '../../store/authStore';
import api from '../../lib/api';
import { Building2, MapPin, Clock, ArrowRight, ClipboardList, CheckCircle2 } from 'lucide-react';

export default function TrackComplaintsPage() {
  const { user } = useAuthStore();
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const fetchCitizenComplaints = async () => {
    if (user?.id) {
      try {
        const { data } = await api.get('/complaints/', {
          params: { citizen_user_id: user.id },
        });
        setComplaints(data);
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    fetchCitizenComplaints();
    const interval = setInterval(fetchCitizenComplaints, 10000); // 10s auto-refresh
    return () => clearInterval(interval);
  }, [user?.id]);

  const handleVerifyResolution = async (complaintId, newStatus) => {
    setVerifying(true);
    try {
      await api.patch(`/complaints/${complaintId}/status`, {
        status: newStatus,
        note: `Citizen confirmed resolution (${newStatus})`,
      });
      setSelectedComplaint(null);
      fetchCitizenComplaints();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update status');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <>
      <Topbar title="Track My Complaints" subtitle="Live progress and resolution audit history" />

      <div className="p-6 space-y-6">
        {complaints.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center animate-fadeIn shadow-xs">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <ClipboardList className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">No complaints logged yet</h3>
            <p className="text-slate-500 text-xs max-w-md mx-auto mb-4">
              When you submit civic issues, they will appear here with live tracking.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {complaints.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedComplaint(c)}
                className="bg-white border border-slate-200 rounded-xl p-5 cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs hover:border-slate-300 transition-all animate-fadeIn"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs font-mono font-bold text-blue-600">#{c.id}</span>
                    <h3 className="font-bold text-slate-900 text-sm">{c.service?.name || 'Service Issue'}</h3>
                    <StatusBadge status={c.status} />
                    <PriorityBadge priority={c.priority} />
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-1">{c.description}</p>
                  <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {c.department?.name}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {c.location?.name}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {c.status === 'completed' && (
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-lg animate-pulse flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Action Required: Confirm Fix
                    </span>
                  )}
                  <Button variant="secondary" className="text-xs px-3 py-1.5">
                    View History <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Detail & Audit History */}
      <Modal
        isOpen={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        title={`Complaint #${selectedComplaint?.id} Details`}
      >
        {selectedComplaint && (
          <div className="space-y-5 text-slate-800">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{selectedComplaint.service?.name}</h3>
                <p className="text-xs text-slate-500">{selectedComplaint.department?.name}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <StatusBadge status={selectedComplaint.status} />
                <PriorityBadge priority={selectedComplaint.priority} />
              </div>
            </div>

            {/* Description & Photo */}
            <div>
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Description
              </h4>
              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/60 leading-relaxed">
                {selectedComplaint.description}
              </p>
            </div>

            {selectedComplaint.photo_url && (
              <div>
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Photo Evidence
                </h4>
                <div className="w-full h-48 rounded-xl overflow-hidden border border-slate-200 bg-slate-900 flex items-center justify-center">
                  <img
                    src={selectedComplaint.photo_url}
                    alt="Complaint photo"
                    className="max-h-full object-contain"
                  />
                </div>
              </div>
            )}

            {/* Assignment Info */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <div className="flex items-center gap-2">
                <Avatar name={selectedComplaint.officer?.name || 'Unassigned'} size="sm" />
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Assigned Officer</span>
                  <p className="font-semibold text-slate-800">{selectedComplaint.officer?.name || 'Unassigned'}</p>
                </div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Location</span>
                <p className="font-semibold text-slate-800 mt-1">{selectedComplaint.location?.name || 'Main Area'}</p>
              </div>
            </div>

            {/* Citizen Action for Completed Status */}
            {selectedComplaint.status === 'completed' && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                <p className="text-xs text-emerald-800 font-bold">
                  Officer has marked this issue as resolved. Please confirm:
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleVerifyResolution(selectedComplaint.id, 'citizen_verified')}
                    disabled={verifying}
                    className="text-xs py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Confirm & Verify Fix
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleVerifyResolution(selectedComplaint.id, 'closed')}
                    disabled={verifying}
                    className="text-xs py-1.5"
                  >
                    Close Complaint
                  </Button>
                </div>
              </div>
            )}

            {/* History Timeline */}
            <div>
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                Audit Timeline
              </h4>
              <div className="relative pl-4 space-y-4 border-l-2 border-slate-200">
                {selectedComplaint.history?.map((h) => (
                  <div key={h.id} className="relative">
                    <div className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full bg-blue-600 border-2 border-white ring-2 ring-blue-100" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 capitalize">{h.status.replace('_', ' ')}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(h.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{h.note}</p>
                    <p className="text-[10px] font-medium text-slate-400">By: {h.changed_by?.name || 'System'}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
