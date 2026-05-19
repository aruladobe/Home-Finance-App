import { useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend
} from 'recharts';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Target, Percent } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useTheme } from '../../context/ThemeContext';
import StatCard from '../../components/common/StatCard';
import { formatCurrency, formatCurrencyCompact, filterByPeriod, filterByFY, calculateProfit, groupByMonth } from '../../utils/calculations';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 text-xs">
      <p className="text-slate-500 dark:text-white/60 mb-2 font-medium">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }} className="font-medium">
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
};

export default function ProfitPage() {
  const { income, expenses, investments, period, financialYear } = useFinance();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
  const tickColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(100,116,139,0.75)';
  const refLineColor = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)';

  const filtered = useMemo(() => ({
    income: financialYear ? filterByFY(income, financialYear) : filterByPeriod(income, period),
    expenses: financialYear ? filterByFY(expenses, financialYear) : filterByPeriod(expenses, period),
    investments: financialYear ? filterByFY(investments, financialYear) : filterByPeriod(investments, period),
  }), [income, expenses, investments, period, financialYear]);

  const stats = useMemo(() => calculateProfit(filtered.income, filtered.expenses, filtered.investments), [filtered]);

  const chartYear = financialYear ? parseInt(financialYear.split('-')[0]) : new Date().getFullYear();

  const monthlyTrend = useMemo(() => {
    const inc = groupByMonth(income, chartYear);
    const exp = groupByMonth(expenses, chartYear);
    const inv = groupByMonth(investments, chartYear);
    return inc.map((item, i) => ({
      month: item.month,
      Income: item.amount,
      Expenses: exp[i].amount,
      Invested: inv[i].amount,
      Profit: item.amount - exp[i].amount - inv[i].amount,
    }));
  }, [income, expenses, investments, chartYear]);

  const cumulativeProfit = useMemo(() => {
    let running = 0;
    return monthlyTrend.map(m => {
      running += m.Profit;
      return { month: m.month, profit: m.Profit, cumulative: running };
    });
  }, [monthlyTrend]);

  const profitMargin = stats.totalIncome > 0 ? ((stats.netProfit / stats.totalIncome) * 100) : 0;
  const expenseRatio = stats.totalIncome > 0 ? ((stats.totalExpenses / stats.totalIncome) * 100) : 0;
  const investmentRate = stats.totalIncome > 0 ? ((stats.totalInvested / stats.totalIncome) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Key metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="col-span-2 lg:col-span-1">
          <div className={`glass-card p-6 h-full bg-gradient-to-br ${stats.netProfit >= 0 ? 'from-emerald-500/15 to-emerald-600/5 border-emerald-500/20' : 'from-red-500/15 to-red-600/5 border-red-500/20'}`}>
            <p className="text-sm font-medium text-slate-500 dark:text-white/50 mb-2">Net Profit / Loss</p>
            <p className={`text-4xl font-bold ${stats.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {stats.netProfit >= 0 ? '+' : ''}{formatCurrency(stats.netProfit)}
            </p>
            <p className="text-sm text-slate-400 dark:text-white/40 mt-2">
              {stats.netProfit >= 0 ? 'Surplus' : 'Deficit'} for {period} period
            </p>
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400 dark:text-white/40">Savings Rate</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">{stats.savingsRate.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 dark:text-white/40">Profit Margin</p>
                <p className={`text-lg font-semibold ${profitMargin >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{profitMargin.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <StatCard title="Total Income" value={formatCurrency(stats.totalIncome)} icon={TrendingUp} color="income" />
          <StatCard title="Total Expenses" value={formatCurrency(stats.totalExpenses)} icon={TrendingDown} color="expense" />
        </div>
        <div className="grid grid-cols-1 gap-4">
          <StatCard title="Total Invested" value={formatCurrency(stats.totalInvested)} icon={Wallet} color="investment" />
          <StatCard title="Actual Returns" value={formatCurrency(stats.totalReturns)} icon={PiggyBank} color="profit" />
        </div>
      </div>

      {/* Financial health ratios */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Expense Ratio', value: expenseRatio, icon: Target, good: expenseRatio < 70, tip: '< 70% is healthy' },
          { label: 'Savings Rate', value: stats.savingsRate, icon: Percent, good: stats.savingsRate > 20, tip: '> 20% is great' },
          { label: 'Investment Rate', value: investmentRate, icon: TrendingUp, good: investmentRate > 15, tip: '> 15% recommended' },
        ].map(({ label, value, icon: Icon, good, tip }) => (
          <div key={label} className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-slate-500 dark:text-white/60">{label}</p>
              <Icon aria-hidden="true" size={16} className={good ? 'text-emerald-400' : 'text-yellow-400'} />
            </div>
            <p className={`text-3xl font-bold ${good ? 'text-emerald-400' : 'text-yellow-400'}`}>{value.toFixed(1)}%</p>
            <div className="mt-3 bg-slate-200 dark:bg-white/10 rounded-full h-1.5">
              <div
                className={`h-full rounded-full transition-all duration-700 ${good ? 'bg-emerald-400' : 'bg-yellow-400'}`}
                style={{ width: `${Math.min(100, Math.abs(value))}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 dark:text-white/30 mt-2">{tip}</p>
          </div>
        ))}
      </div>

      {/* Monthly profit trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <h3 className="section-title mb-4">Monthly Profit Trend</h3>
          <div role="img" aria-label="Bar chart showing monthly profit trend over the year">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart aria-hidden="true" data={monthlyTrend} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="month" tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => formatCurrencyCompact(v)} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke={refLineColor} />
              <Bar dataKey="Profit" radius={[4,4,0,0]}>
                {monthlyTrend.map((entry, i) => (
                  <rect key={i} fill={entry.Profit >= 0 ? '#10b981' : '#ef4444'} />
                ))}
              </Bar>
              <Bar dataKey="Profit" fill="#6366f1" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 className="section-title mb-4">Cumulative Profit</h3>
          <div role="img" aria-label="Area chart showing cumulative profit running total over the year">
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart aria-hidden="true" data={cumulativeProfit} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="cumGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="month" tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => formatCurrencyCompact(v)} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke={refLineColor} />
              <Area type="monotone" dataKey="cumulative" name="Cumulative" stroke="#6366f1" strokeWidth={2} fill="url(#cumGrad)" />
            </AreaChart>
          </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Full income vs expenses bar */}
      <div className="glass-card p-5">
        <h3 className="section-title mb-4">Income, Expenses & Investment Overview</h3>
        <div role="img" aria-label="Bar chart comparing monthly income, expenses, and investments">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart aria-hidden="true" data={monthlyTrend} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="month" tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => formatCurrencyCompact(v)} />
            <Tooltip content={<CustomTooltip />} />
            <Legend formatter={val => <span className="text-slate-500 dark:text-white/60 text-xs">{val}</span>} />
            <Bar dataKey="Income" fill="#10b981" radius={[4,4,0,0]} />
            <Bar dataKey="Expenses" fill="#ef4444" radius={[4,4,0,0]} />
            <Bar dataKey="Invested" fill="#3b82f6" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
