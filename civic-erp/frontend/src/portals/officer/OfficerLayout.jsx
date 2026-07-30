import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';

export default function OfficerLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar portal="officer" />
      <main className="flex-1 ml-64">
        <Outlet />
      </main>
    </div>
  );
}
