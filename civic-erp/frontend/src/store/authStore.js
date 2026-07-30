/**
 * Auth store — manages JWT token, user object, and login/logout.
 */
import { create } from 'zustand';
import api from '../lib/api';

const useAuthStore = create((set, get) => ({
  token: localStorage.getItem('civicos_token') || null,
  user: JSON.parse(localStorage.getItem('civicos_user') || 'null'),
  permissions: JSON.parse(localStorage.getItem('civicos_permissions') || '[]'),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('civicos_token', data.access_token);
      localStorage.setItem('civicos_user', JSON.stringify(data.user));
      localStorage.setItem('civicos_permissions', JSON.stringify(data.permissions));
      set({
        token: data.access_token,
        user: data.user,
        permissions: data.permissions,
        loading: false,
      });
      return data;
    } catch (err) {
      const msg = err.response?.data?.detail || 'Login failed';
      set({ loading: false, error: msg });
      throw new Error(msg);
    }
  },

  logout: () => {
    localStorage.removeItem('civicos_token');
    localStorage.removeItem('civicos_user');
    localStorage.removeItem('civicos_permissions');
    set({ token: null, user: null, permissions: [] });
  },

  isAuthenticated: () => !!get().token,

  getRoleName: () => get().user?.role?.name || 'guest',
}));

export default useAuthStore;
