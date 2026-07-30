import { useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import ToastContainer, { showToast } from '../../components/Toast';
import useSocket from '../../lib/useSocket';

export default function OfficerLayout() {
  const handleSocketEvent = useCallback((event, data) => {
    if (event === 'complaint_assigned') {
      showToast(`New task assigned: Complaint #${data.complaint_id}!`, 'info');
    } else if (event === 'status_changed') {
      showToast(`Task #${data.complaint_id} updated: ${data.status.replace('_', ' ')}`, 'success');
    }
  }, []);

  useSocket(handleSocketEvent);

  return (
    <div className="flex min-h-screen bg-slate-50 overflow-x-hidden">
      <Sidebar portal="officer" />
      <main className="flex-1 ml-60 min-w-0 min-h-screen">
        <Outlet />
      </main>
      <ToastContainer />
    </div>
  );
}
