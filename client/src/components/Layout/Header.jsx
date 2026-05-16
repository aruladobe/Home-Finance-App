import { useState } from 'react';
import { Menu, Bell, RefreshCw, CalendarDays, Download } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { getAvailableFYs } from '../../utils/calculations';
import { useLocation } from 'react-router-dom';
import StatementDownloadModal from '../common/StatementDownloadModal';

const FY_OPTIONS = getAvailableFYs(5);

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/income': 'Income',
  '/expenses': 'Expenses',
  '/investments': 'Investments',
  '/profit': 'Profit & Analytics',
  '/users': 'User Management',
};

export default function Header({ onMenuClick }) {
  const { period, setPeriod, financialYear, setFinancialYear, fetchAll, loading, income, expenses, investments } = useFinance();
  const { user } = useAuth();
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'FinanceHome';
  const [statementOpen, setStatementOpen] = useState(false);

  return (
    <>
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
        {/* Financial Year filter */}
        <div className="hidden sm:flex items-center gap-1.5 glass-card px-2 py-1">
          <CalendarDays size={13} className={financialYear ? 'text-primary-400' : 'text-white/30'} />
          <select
            value={financialYear || ''}
            onChange={e => setFinancialYear(e.target.value || null)}
            className={`bg-transparent text-xs font-medium border-none outline-none cursor-pointer pr-1 transition-colors ${
              financialYear ? 'text-primary-400' : 'text-white/50 hover:text-white'
            }`}
          >
            <option value="">All Years</option>
            {FY_OPTIONS.map(fy => (
              <option key={fy} value={fy}>FY {fy}</option>
            ))}
          </select>
        </div>

        {/* Period filter — disabled when FY is active */}
        <div className={`hidden sm:flex items-center gap-1 glass-card p-1 transition-opacity ${financialYear ? 'opacity-30 pointer-events-none' : ''}`}>
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
          onClick={() => setStatementOpen(true)}
          className="p-2 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          title="Download Statement"
        >
          <Download size={17} />
        </button>

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

    <StatementDownloadModal
      isOpen={statementOpen}
      onClose={() => setStatementOpen(false)}
      income={income}
      expenses={expenses}
      investments={investments}
      userName={user?.name}
      activeFY={financialYear}
    />
    </>
  );
}
