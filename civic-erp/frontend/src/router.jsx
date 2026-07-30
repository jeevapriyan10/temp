import { createBrowserRouter, Navigate } from 'react-router-dom';

// Auth
import Login from './portals/admin/Login';

// Admin
import AdminLayout from './portals/admin/AdminLayout';
import AdminDashboard from './portals/admin/AdminDashboard';
import DepartmentsPage from './portals/admin/DepartmentsPage';
import ServicesPage from './portals/admin/ServicesPage';
import UsersPage from './portals/admin/UsersPage';
import LocationsPage from './portals/admin/LocationsPage';
import RolesPage from './portals/admin/RolesPage';
import ComplaintsPage from './portals/admin/ComplaintsPage';
import AnalyticsPage from './portals/admin/AnalyticsPage';

// Department
import DepartmentLayout from './portals/department/DepartmentLayout';
import DepartmentDashboard from './portals/department/DepartmentDashboard';
import InventoryPage from './portals/department/InventoryPage';

// Officer
import OfficerLayout from './portals/officer/OfficerLayout';
import OfficerDashboard from './portals/officer/OfficerDashboard';

// Citizen
import CitizenLayout from './portals/citizen/CitizenLayout';
import CitizenHome from './portals/citizen/CitizenHome';
import ReportComplaintPage from './portals/citizen/ReportComplaintPage';
import TrackComplaintsPage from './portals/citizen/TrackComplaintsPage';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'complaints', element: <ComplaintsPage /> },
      { path: 'analytics', element: <AnalyticsPage /> },
      { path: 'departments', element: <DepartmentsPage /> },
      { path: 'services', element: <ServicesPage /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'roles', element: <RolesPage /> },
      { path: 'locations', element: <LocationsPage /> },
    ],
  },
  {
    path: '/department',
    element: <DepartmentLayout />,
    children: [
      { index: true, element: <DepartmentDashboard /> },
      { path: 'inventory', element: <InventoryPage /> },
    ],
  },
  {
    path: '/officer',
    element: <OfficerLayout />,
    children: [
      { index: true, element: <OfficerDashboard /> },
    ],
  },
  {
    path: '/citizen',
    element: <CitizenLayout />,
    children: [
      { index: true, element: <CitizenHome /> },
      { path: 'report', element: <ReportComplaintPage /> },
      { path: 'track', element: <TrackComplaintsPage /> },
    ],
  },
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);

export default router;
