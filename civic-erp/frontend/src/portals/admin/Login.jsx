import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const roleRedirects = {
  super_admin: '/admin',
  org_admin: '/admin',
  department_head: '/department',
  department_manager: '/department',
  officer: '/officer',
  supervisor: '/officer',
  citizen: '/citizen',
  guest: '/citizen',
  auditor: '/admin',
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(email, password);
      const roleName = data.user?.role?.name || 'citizen';
      navigate(roleRedirects[roleName] || '/citizen');
    } catch {
      // error is set in the store
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-civic-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-civic-700/5 rounded-full blur-3xl" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-civic-500/20 to-transparent" />
      </div>

      <div className="relative w-full max-w-md mx-4 animate-fadeIn">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-civic-500 to-civic-700 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-xl shadow-civic-500/20">
            C
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">CivicOS</h1>
          <p className="text-surface-400 mt-2">Civic Operations Platform</p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Sign in to your account</h2>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-fadeIn">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="label-text">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@demo.com"
                required
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="password" className="label-text">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="input-field"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 pt-6 border-t border-surface-700/50">
            <p className="text-xs text-surface-500 mb-3">Demo accounts (password: demo1234)</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Admin', email: 'org_admin@demo.com' },
                { label: 'Dept Head', email: 'department_head@demo.com' },
                { label: 'Officer', email: 'officer@demo.com' },
                { label: 'Citizen', email: 'citizen@demo.com' },
              ].map((demo) => (
                <button
                  key={demo.email}
                  type="button"
                  onClick={() => { setEmail(demo.email); setPassword('demo1234'); }}
                  className="text-xs px-3 py-2 rounded-lg bg-surface-700/50 text-surface-400 hover:text-civic-400 hover:bg-surface-700 transition-colors"
                >
                  {demo.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
