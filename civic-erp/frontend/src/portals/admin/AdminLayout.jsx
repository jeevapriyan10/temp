import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar portal="admin" />
      <main className="flex-1 ml-64">
        <Outlet />
      </main>
    </div>
  );
}
