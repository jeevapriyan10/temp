import { useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import ToastContainer, { showToast } from '../../components/Toast';
import useSocket from '../../lib/useSocket';

export default function DepartmentLayout() {
  const handleSocketEvent = useCallback((event, data) => {
    if (event === 'complaint_created') {
      showToast(`New complaint #${data.complaint_id} logged in department queue`, 'info');
    } else if (event === 'status_changed') {
      showToast(`Complaint #${data.complaint_id} status changed to ${data.status.replace('_', ' ')}`, 'success');
    }
  }, []);

  useSocket(handleSocketEvent);

  return (
    <div className="flex min-h-screen">
      <Sidebar portal="department" />
      <main className="flex-1 ml-64">
        <Outlet />
      </main>
      <ToastContainer />
    </div>
  );
}
