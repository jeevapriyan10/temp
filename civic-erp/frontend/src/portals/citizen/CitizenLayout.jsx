import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import AiChatbot from '../../components/AiChatbot';
import ToastContainer from '../../components/Toast';

export default function CitizenLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar portal="citizen" />
      <main className="flex-1 ml-64">
        <Outlet />
      </main>
      <AiChatbot />
      <ToastContainer />
    </div>
  );
}
