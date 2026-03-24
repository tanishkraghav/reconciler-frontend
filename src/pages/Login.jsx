import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center font-mono font-semibold text-black text-lg">₹≋</div>
          <div>
            <h1 className="text-xl font-bold text-white">Reconciler</h1>
            <p className="text-xs text-muted font-mono">Transaction Reconciliation Engine</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8">
          <h2 className="text-lg font-bold text-white mb-6">Sign in</h2>

          {error && <div className="bg-[#2a1316] border border-[#3d1a1e] text-danger text-sm rounded-lg px-4 py-3 mb-4">{error}</div>}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs text-muted uppercase tracking-widest mb-1.5">Email</label>
              <input type="email" required value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-accent transition-colors"
                placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-xs text-muted uppercase tracking-widest mb-1.5">Password</label>
              <input type="password" required value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-accent transition-colors"
                placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-accent hover:bg-[#00fdb5] text-black font-bold py-2.5 rounded-lg transition-colors text-sm mt-2 disabled:opacity-50">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-muted mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-accent hover:underline">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
