import { useState } from 'react';
import { Menu, Bell, RefreshCw, CalendarDays, Download, Sun, Moon } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
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
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'FinanceHome';
  const [statementOpen, setStatementOpen] = useState(false);

  return (
    <>
    <header className="sticky top-0 z-10 h-16 bg-slate-50/90 dark:bg-dark-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 flex items-center px-4 lg:px-6 gap-4">
      <button
        onClick={onMenuClick}
        aria-label="Toggle navigation menu"
        className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <Menu size={20} aria-hidden="true" />
      </button>

      <div className="flex-1">
        <h1 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Financial Year filter */}
        <div className="hidden sm:flex items-center gap-1.5 glass-card px-2 py-1">
          <CalendarDays size={13} aria-hidden="true" className={financialYear ? 'text-primary-400' : 'text-slate-400 dark:text-white/30'} />
          <label htmlFor="fy-filter" className="sr-only">Filter by financial year</label>
          <select
            id="fy-filter"
            value={financialYear || ''}
            onChange={e => setFinancialYear(e.target.value || null)}
            className={`bg-transparent text-xs font-medium border-none outline-none cursor-pointer pr-1 transition-colors ${
              financialYear ? 'text-primary-400' : 'text-slate-400 dark:text-white/50 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <option value="">All Years</option>
            {FY_OPTIONS.map(fy => (
              <option key={fy} value={fy}>FY {fy}</option>
            ))}
          </select>
        </div>

        {/* Period filter — disabled when FY is active */}
        <div
          role="group"
          aria-label="Filter by period"
          className={`hidden sm:flex items-center gap-0.5 glass-card p-1 transition-opacity ${financialYear ? 'opacity-30 pointer-events-none' : ''}`}
        >
          {[
            { value: 'daily',       label: '1D' },
            { value: 'weekly',      label: '1W' },
            { value: 'monthly',     label: '1M' },
            { value: 'quarterly',   label: '3M' },
            { value: 'half-yearly', label: '6M' },
            { value: 'yearly',      label: '1Y' },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setPeriod(value)}
              aria-pressed={period === value}
              aria-label={value}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                period === value
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/30'
                  : 'text-slate-400 dark:text-white/50 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setStatementOpen(true)}
          aria-label="Download statement"
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <Download size={17} aria-hidden="true" />
        </button>

        <button
          onClick={fetchAll}
          aria-label={loading ? 'Refreshing data…' : 'Refresh data'}
          aria-busy={loading}
          className={`p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white transition-all duration-200 ${loading ? 'animate-spin text-primary-400' : ''}`}
        >
          <RefreshCw size={17} aria-hidden="true" />
        </button>

        <button
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          {theme === 'dark' ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
        </button>

        <button
          aria-label="Notifications"
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white transition-colors relative"
        >
          <Bell size={17} aria-hidden="true" />
          <span aria-hidden="true" className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary-500 rounded-full" />
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
