import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, TrendingUp, TrendingDown, Wallet,
  PieChart, Users, LogOut, Home, Calculator
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/income', icon: TrendingUp, label: 'Income' },
  { path: '/expenses', icon: TrendingDown, label: 'Expenses' },
  { path: '/investments', icon: Wallet, label: 'Investments' },
  { path: '/profit', icon: PieChart, label: 'Profit' },
  { path: '/users', icon: Users, label: 'User Management' },
  { path: '/calculator', icon: Calculator, label: 'Calculator' },
];

const RELATIONSHIP_AVATARS = {
  Father: '👨', Mother: '👩', Son: '👦', Daughter: '👧',
  Spouse: '💑', Grandfather: '👴', Grandmother: '👵', Other: '👤'
};

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/60 z-20 lg:hidden" onClick={onClose} />
      )}
      <aside className={`
        fixed left-0 top-0 h-full w-64 z-30
        bg-white/97 dark:bg-dark-900/90 backdrop-blur-xl border-r border-slate-200 dark:border-white/10
        flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-200 dark:border-white/10">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Home size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">FinanceHome</p>
            <p className="text-xs text-slate-400 dark:text-white/40">Family Finance</p>
          </div>
        </div>

        {/* User info */}
        <div className="px-4 py-4 mx-3 mt-4 glass-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-lg">
              {RELATIONSHIP_AVATARS[user?.relationship] || '👤'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-slate-400 dark:text-white/40 truncate">{user?.relationship || 'Member'}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="text-xs font-semibold text-slate-400 dark:text-white/30 uppercase tracking-wider px-3 mb-3">Menu</p>
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200 group
                ${isActive
                  ? 'bg-gradient-to-r from-primary-600/30 to-purple-600/20 text-slate-900 dark:text-white border border-primary-500/30'
                  : 'text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <span className={`flex-shrink-0 ${isActive ? 'text-primary-500 dark:text-primary-400' : 'text-slate-400 dark:text-white/40 group-hover:text-slate-600 dark:group-hover:text-white/70'}`}>
                    <Icon size={18} />
                  </span>
                  {label}
                  {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-400" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-slate-200 dark:border-white/10">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                       text-red-500/80 dark:text-red-400/80 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
