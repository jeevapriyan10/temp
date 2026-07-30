import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import AiChatbot from '../../components/AiChatbot';
import ToastContainer from '../../components/Toast';

export default function CitizenLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50 overflow-x-hidden">
      <Sidebar portal="citizen" />
      <main className="flex-1 ml-60 min-w-0 min-h-screen">
        <Outlet />
      </main>
      <AiChatbot />
      <ToastContainer />
    </div>
  );
}
