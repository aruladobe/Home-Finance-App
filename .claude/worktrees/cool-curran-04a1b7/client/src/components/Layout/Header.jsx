import { Menu, Bell, RefreshCw } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useLocation } from 'react-router-dom';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/income': 'Income',
  '/expenses': 'Expenses',
  '/investments': 'Investments',
  '/profit': 'Profit & Analytics',
  '/users': 'User Management',
};

export default function Header({ onMenuClick }) {
  const { period, setPeriod, fetchAll, loading } = useFinance();
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'FinanceHome';

  return (
    <header className="sticky top-0 z-10 h-16 bg-dark-950/80 backdrop-blur-xl border-b border-white/10 flex items-center px-4 lg:px-6 gap-4">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-colors"
      >
        <Menu size={20} />
      </button>

      <div className="flex-1">
        <h1 className="text-lg font-semibold text-white">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Period filter */}
        <div className="hidden sm:flex items-center gap-1 glass-card p-1">
          {['daily', 'monthly', 'yearly'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all duration-200 ${
                period === p
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/30'
                  : 'text-white/50 hover:text-white hover:bg-white/10'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <button
          onClick={fetchAll}
          className={`p-2 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-all duration-200 ${loading ? 'animate-spin text-primary-400' : ''}`}
          title="Refresh data"
        >
          <RefreshCw size={17} />
        </button>

        <button className="p-2 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-colors relative">
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary-500 rounded-full" />
        </button>
      </div>
    </header>
  );
}
