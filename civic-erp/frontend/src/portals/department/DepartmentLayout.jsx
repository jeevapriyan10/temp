import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';

export default function DepartmentLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar portal="department" />
      <main className="flex-1 ml-64">
        <Outlet />
      </main>
    </div>
  );
}
