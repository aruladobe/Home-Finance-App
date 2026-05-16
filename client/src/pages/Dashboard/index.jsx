import { useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useTheme } from '../../context/ThemeContext';
import StatCard from '../../components/common/StatCard';
import {
  formatCurrency, formatCurrencyCompact, filterByPeriod, filterByFY, sumAmounts, calculateProfit,
  groupByMonth, groupByCategory, CATEGORY_COLORS, INCOME_COLORS
} from '../../utils/calculations';
import { format } from 'date-fns';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 text-xs">
      <p className="text-slate-500 dark:text-white/60 mb-2">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }} className="font-medium">
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { income, expenses, investments, period, financialYear } = useFinance();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
  const tickColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(100,116,139,0.75)';

  const filtered = useMemo(() => ({
    income: financialYear ? filterByFY(income, financialYear) : filterByPeriod(income, period),
    expenses: financialYear ? filterByFY(expenses, financialYear) : filterByPeriod(expenses, period),
    investments: financialYear ? filterByFY(investments, financialYear) : filterByPeriod(investments, period),
  }), [income, expenses, investments, period, financialYear]);

  const stats = useMemo(() => calculateProfit(filtered.income, filtered.expenses, filtered.investments), [filtered]);

  const monthlyData = useMemo(() => {
    const incomeByMonth = groupByMonth(income);
    const expenseByMonth = groupByMonth(expenses);
    return incomeByMonth.map((item, i) => ({
      month: item.month,
      Income: item.amount,
      Expenses: expenseByMonth[i].amount,
      Profit: Math.max(0, item.amount - expenseByMonth[i].amount),
    }));
  }, [income, expenses]);

  const categoryData = useMemo(() => groupByCategory(filtered.expenses).slice(0, 6), [filtered.expenses]);

  const incomeByType = useMemo(() => {
    const groups = {};
    filtered.income.forEach(i => { groups[i.type] = (groups[i.type] || 0) + Number(i.amount); });
    return Object.entries(groups).map(([name, value]) => ({ name, value }));
  }, [filtered.income]);

  const recentTransactions = useMemo(() => {
    const all = [
      ...filtered.income.map(i => ({ ...i, _type: 'income' })),
      ...filtered.expenses.map(e => ({ ...e, _type: 'expense' })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);
    return all;
  }, [filtered]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Income" value={formatCurrency(stats.totalIncome)} icon={TrendingUp} color="income"
          subtitle={`${filtered.income.length} transactions`} />
        <StatCard title="Total Expenses" value={formatCurrency(stats.totalExpenses)} icon={TrendingDown} color="expense"
          subtitle={`${filtered.expenses.length} transactions`} />
        <StatCard title="Invested" value={formatCurrency(stats.totalInvested)} icon={Wallet} color="investment"
          subtitle={`${filtered.investments.length} investments`} />
        <StatCard
          title="Net Profit"
          value={formatCurrency(Math.abs(stats.netProfit))}
          icon={PiggyBank}
          color="profit"
          subtitle={`${stats.savingsRate.toFixed(1)}% savings rate`}
          trend={stats.netProfit >= 0 ? 1 : -1}
          trendValue={stats.savingsRate.toFixed(1)}
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area chart */}
        <div className="lg:col-span-2 glass-card p-5">
          <h3 className="section-title mb-4">Income vs Expenses (Monthly)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthlyData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="month" tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => formatCurrencyCompact(v)} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="Income" stroke="#10b981" strokeWidth={2} fill="url(#incomeGrad)" />
              <Area type="monotone" dataKey="Expenses" stroke="#ef4444" strokeWidth={2} fill="url(#expenseGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Pie */}
        <div className="glass-card p-5">
          <h3 className="section-title mb-4">Expense Categories</h3>
          {categoryData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                    dataKey="value" paddingAngle={3}>
                    {categoryData.map((entry) => (
                      <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || '#6366f1'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => formatCurrency(val)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {categoryData.map(item => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[item.name] || '#6366f1' }} />
                      <span className="text-slate-500 dark:text-white/60">{item.name}</span>
                    </div>
                    <span className="text-slate-900 dark:text-white font-medium">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400 dark:text-white/30 text-sm">No expense data</div>
          )}
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar chart */}
        <div className="lg:col-span-2 glass-card p-5">
          <h3 className="section-title mb-4">Monthly Profit Overview</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="month" tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => formatCurrencyCompact(v)} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Income" fill="#10b981" radius={[4,4,0,0]} />
              <Bar dataKey="Expenses" fill="#ef4444" radius={[4,4,0,0]} />
              <Bar dataKey="Profit" fill="#6366f1" radius={[4,4,0,0]} />
              <Legend formatter={(val) => <span className="text-slate-500 dark:text-white/60 text-xs">{val}</span>} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Income by type */}
        <div className="glass-card p-5">
          <h3 className="section-title mb-4">Income Sources</h3>
          {incomeByType.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={incomeByType} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                    dataKey="value" paddingAngle={3}>
                    {incomeByType.map((entry) => (
                      <Cell key={entry.name} fill={INCOME_COLORS[entry.name] || '#6366f1'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => formatCurrency(val)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {incomeByType.map(item => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: INCOME_COLORS[item.name] || '#6366f1' }} />
                      <span className="text-slate-500 dark:text-white/60">{item.name}</span>
                    </div>
                    <span className="text-slate-900 dark:text-white font-medium">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400 dark:text-white/30 text-sm">No income data</div>
          )}
        </div>
      </div>

      {/* Recent transactions */}
      <div className="glass-card p-5">
        <h3 className="section-title mb-4">Recent Transactions</h3>
        {recentTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10">
                  <th className="table-header text-left pb-3">Type</th>
                  <th className="table-header text-left pb-3 hidden sm:table-cell">Category / Source</th>
                  <th className="table-header text-left pb-3 hidden md:table-cell">Member</th>
                  <th className="table-header text-left pb-3 hidden lg:table-cell">Date</th>
                  <th className="table-header text-right pb-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map(tx => (
                  <tr key={tx._id || tx.id} className="table-row">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${tx._type === 'income' ? 'bg-income' : 'bg-expense'}`}>
                          {tx._type === 'income'
                            ? <ArrowUpRight size={14} className="text-income" />
                            : <ArrowDownRight size={14} className="text-expense" />}
                        </div>
                        <span className="text-sm text-slate-900 dark:text-white capitalize">{tx._type}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 hidden sm:table-cell">
                      <span className="text-sm text-slate-600 dark:text-white/70">{tx.category || tx.type}</span>
                    </td>
                    <td className="py-3 pr-4 hidden md:table-cell">
                      <span className="text-sm text-slate-500 dark:text-white/50">{tx.familyMemberName || 'Self'}</span>
                    </td>
                    <td className="py-3 pr-4 hidden lg:table-cell">
                      <span className="text-sm text-slate-400 dark:text-white/40">{tx.date ? format(new Date(tx.date), 'dd MMM yyyy') : '-'}</span>
                    </td>
                    <td className={`py-3 text-right font-semibold text-sm ${tx._type === 'income' ? 'text-income' : 'text-expense'}`}>
                      {tx._type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 dark:text-white/30">
            <p>No transactions yet. Start by adding income or expenses.</p>
          </div>
        )}
      </div>
    </div>
  );
}
