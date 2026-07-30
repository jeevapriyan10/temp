/**
 * Org store — manages org-level data fetched from the API.
 */
import { create } from 'zustand';
import api from '../lib/api';

const useOrgStore = create((set) => ({
  organizations: [],
  departments: [],
  services: [],
  locations: [],
  users: [],
  roles: [],
  loading: false,

  fetchOrganizations: async () => {
    set({ loading: true });
    const { data } = await api.get('/organizations/');
    set({ organizations: data, loading: false });
  },

  fetchDepartments: async (orgId) => {
    set({ loading: true });
    const params = orgId ? { org_id: orgId } : {};
    const { data } = await api.get('/departments/', { params });
    set({ departments: data, loading: false });
  },

  fetchServices: async (departmentId) => {
    set({ loading: true });
    const params = departmentId ? { department_id: departmentId } : {};
    const { data } = await api.get('/services/', { params });
    set({ services: data, loading: false });
  },

  fetchLocations: async (orgId) => {
    set({ loading: true });
    const params = orgId ? { org_id: orgId } : {};
    const { data } = await api.get('/locations/', { params });
    set({ locations: data, loading: false });
  },

  fetchUsers: async (orgId) => {
    set({ loading: true });
    const params = orgId ? { org_id: orgId } : {};
    const { data } = await api.get('/users/', { params });
    set({ users: data, loading: false });
  },

  fetchRoles: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/roles/');
      set({ roles: data, loading: false });
    } catch {
      set({ loading: false });
    }
  },
}));

export default useOrgStore;
