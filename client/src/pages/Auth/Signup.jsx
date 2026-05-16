import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Eye, EyeOff, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const RELATIONSHIPS = ['Self', 'Father', 'Mother', 'Son', 'Daughter', 'Spouse', 'Grandfather', 'Grandmother', 'Other'];
const ROLES = ['admin', 'user', 'manager'];
const ROLE_LABELS = { admin: 'Admin', user: 'User', manager: 'Manager' };

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', relationship: 'Self', phone: '', role: 'user' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await signup(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div aria-hidden="true" className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 shadow-2xl shadow-primary-900/50 mb-4">
            <Home size={26} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Create Account</h1>
          <p className="text-slate-500 dark:text-white/50">Start managing your family finances today</p>
        </div>

        <div className="glass-card p-8">
          {error && (
            <div role="alert" className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label htmlFor="signup-name" className="label">Full Name</label>
                <input id="signup-name" type="text" className="input-field" placeholder="John Doe" value={form.name} onChange={set('name')} required />
              </div>
              <div className="col-span-2">
                <label htmlFor="signup-email" className="label">Email Address</label>
                <input id="signup-email" type="email" className="input-field" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
              </div>
              <div>
                <label htmlFor="signup-relationship" className="label">Relationship</label>
                <select id="signup-relationship" className="select-field" value={form.relationship} onChange={set('relationship')}>
                  {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="signup-role" className="label">Role</label>
                <select id="signup-role" className="select-field" value={form.role} onChange={set('role')}>
                  {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label htmlFor="signup-phone" className="label">Phone (optional)</label>
                <input id="signup-phone" type="tel" className="input-field" placeholder="+91 98765 43210" value={form.phone} onChange={set('phone')} />
              </div>
              <div className="col-span-2">
                <label htmlFor="signup-password" className="label">Password</label>
                <div className="relative">
                  <input
                    id="signup-password"
                    type={showPw ? 'text' : 'password'}
                    className="input-field pr-11"
                    placeholder="Min 6 characters"
                    value={form.password}
                    onChange={set('password')}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                    aria-controls="signup-password"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/30 hover:text-slate-600 dark:hover:text-white/70 transition-colors"
                  >
                    {showPw ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span aria-hidden="true" className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus size={18} aria-hidden="true" />
                  Create Account
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-slate-500 dark:text-white/50 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 font-medium transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
