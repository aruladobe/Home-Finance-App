import { useMemo, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useTheme } from '../../context/ThemeContext';
import StatCard from '../../components/common/StatCard';
import Modal from '../../components/common/Modal';
import ProjectionPanel from '../../components/common/ProjectionPanel';
import {
  formatCurrency, formatCurrencyCompact, filterByPeriod, filterByFY, sumAmounts, calculateProfit,
  groupByMonth, groupByCategory, CATEGORY_COLORS, INCOME_COLORS, calculateProjection
} from '../../utils/calculations';
import { format, isPast, isToday, differenceInDays, addDays } from 'date-fns';

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
  const { income, expenses, investments, plannedExpenses, period, financialYear } = useFinance();
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

  const [detailTx, setDetailTx] = useState(null);
  const [detailPlanned, setDetailPlanned] = useState(null);

  const upcomingPlanned = useMemo(() => {
    const cutoff = addDays(new Date(), 30);
    return (plannedExpenses || [])
      .filter(e => new Date(e.effectiveDate) <= cutoff)
      .sort((a, b) => new Date(a.effectiveDate) - new Date(b.effectiveDate));
  }, [plannedExpenses]);

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
          <div role="img" aria-label="Area chart showing monthly income vs expenses trend">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart aria-hidden="true" data={monthlyData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
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
        </div>

        {/* Category Pie */}
        <div className="glass-card p-5">
          <h3 className="section-title mb-4">Expense Categories</h3>
          {categoryData.length > 0 ? (
            <>
              <div role="img" aria-label="Pie chart showing expense distribution by category">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart aria-hidden="true">
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                    dataKey="value" paddingAngle={3}>
                    {categoryData.map((entry) => (
                      <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || '#6366f1'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => formatCurrency(val)} />
                </PieChart>
              </ResponsiveContainer>
              </div>
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
          <div role="img" aria-label="Bar chart showing monthly income, expenses, and profit overview">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart aria-hidden="true" data={monthlyData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
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
        </div>

        {/* Income by type */}
        <div className="glass-card p-5">
          <h3 className="section-title mb-4">Income Sources</h3>
          {incomeByType.length > 0 ? (
            <>
              <div role="img" aria-label="Pie chart showing income distribution by source type">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart aria-hidden="true">
                  <Pie data={incomeByType} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                    dataKey="value" paddingAngle={3}>
                    {incomeByType.map((entry) => (
                      <Cell key={entry.name} fill={INCOME_COLORS[entry.name] || '#6366f1'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => formatCurrency(val)} />
                </PieChart>
              </ResponsiveContainer>
              </div>
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

      {/* Upcoming planned expenses */}
      {upcomingPlanned.length > 0 && (
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock size={16} aria-hidden="true" className="text-amber-400" />
              <h3 className="section-title">Upcoming Planned Expenses</h3>
            </div>
            <span className="text-xs text-slate-400 dark:text-white/40">Next 30 days · {upcomingPlanned.length} item{upcomingPlanned.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="space-y-2">
            {upcomingPlanned.map(item => {
              const d = new Date(item.effectiveDate);
              const days = differenceInDays(d, new Date());
              const isDue = isPast(d) || isToday(d);
              const isSoon = !isDue && days <= 5;
              return (
                <div key={item._id || item.id} onClick={() => setDetailPlanned(item)} className={`flex items-center justify-between p-3 rounded-xl cursor-pointer ${isDue ? 'bg-red-500/10 border border-red-500/20' : isSoon ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-slate-50 dark:bg-white/5'}`}>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: CATEGORY_COLORS[item.category] || '#6366f1' }} />
                    <span className="text-sm text-slate-700 dark:text-white/80 truncate">{item.category}</span>
                    {item.familyMemberName && <span className="text-xs text-slate-400 dark:text-white/30 hidden sm:inline">· {item.familyMemberName}</span>}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                    <span className="text-xs text-slate-400 dark:text-white/40 hidden sm:inline">{format(d, 'dd MMM')}</span>
                    {isDue
                      ? <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-400">Due</span>
                      : <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${isSoon ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>In {days}d</span>
                    }
                    <span className="text-sm font-semibold text-expense">{formatCurrency(item.amount)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent transactions */}
      <div className="glass-card p-5">
        <h3 className="section-title mb-4">Recent Transactions</h3>
        {recentTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10">
                  <th scope="col" className="table-header text-left pb-3">Type</th>
                  <th scope="col" className="table-header text-left pb-3 hidden sm:table-cell">Category / Source</th>
                  <th scope="col" className="table-header text-left pb-3 hidden md:table-cell">Member</th>
                  <th scope="col" className="table-header text-left pb-3 hidden lg:table-cell">Date</th>
                  <th scope="col" className="table-header text-right pb-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map(tx => (
                  <tr key={tx._id || tx.id} onClick={() => setDetailTx(tx)} className="table-row cursor-pointer">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div aria-hidden="true" className={`w-7 h-7 rounded-lg flex items-center justify-center ${tx._type === 'income' ? 'bg-income' : 'bg-expense'}`}>
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
      {/* Planned expense detail modal */}
      <Modal isOpen={!!detailPlanned} onClose={() => setDetailPlanned(null)} title="Planned Expense Details">
        {detailPlanned && (() => {
          const d = new Date(detailPlanned.effectiveDate);
          const days = differenceInDays(d, new Date());
          const isDue = isPast(d) || isToday(d);
          const isSoon = !isDue && days <= 5;
          const heroBg = isDue ? 'bg-red-500/10 border-red-500/20' : isSoon ? 'bg-amber-500/10 border-amber-500/20' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10';
          return (
            <div className="space-y-4">
              <div className={`flex items-center justify-between p-4 rounded-xl border ${heroBg}`}>
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: CATEGORY_COLORS[detailPlanned.category] || '#6366f1' }} />
                  <div>
                    <p className="text-xs text-slate-400 dark:text-white/40">Category</p>
                    <p className="text-base font-semibold text-slate-900 dark:text-white">{detailPlanned.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 dark:text-white/40">Amount</p>
                  <p className="text-2xl font-bold text-expense">{formatCurrency(detailPlanned.amount)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="glass-card p-3 rounded-xl">
                  <p className="text-xs text-slate-400 dark:text-white/40 mb-0.5">Effective Date</p>
                  <p className="text-sm font-medium text-slate-800 dark:text-white">{format(d, 'dd MMM yyyy')}</p>
                </div>
                <div className="glass-card p-3 rounded-xl">
                  <p className="text-xs text-slate-400 dark:text-white/40 mb-0.5">Status</p>
                  <div className="mt-0.5">
                    {isDue
                      ? <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-400">Due</span>
                      : <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${isSoon ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>In {days}d</span>
                    }
                  </div>
                </div>
                <div className="glass-card p-3 rounded-xl">
                  <p className="text-xs text-slate-400 dark:text-white/40 mb-0.5">Period</p>
                  <p className="text-sm font-medium text-slate-800 dark:text-white capitalize">{detailPlanned.period || '—'}</p>
                </div>
                <div className="glass-card p-3 rounded-xl">
                  <p className="text-xs text-slate-400 dark:text-white/40 mb-0.5">Family Member</p>
                  <p className="text-sm font-medium text-slate-800 dark:text-white">{detailPlanned.familyMemberName || 'Self'}</p>
                </div>
              </div>

              {detailPlanned.description && (
                <div className="glass-card p-3 rounded-xl">
                  <p className="text-xs text-slate-400 dark:text-white/40 mb-0.5">Description</p>
                  <p className="text-sm text-slate-700 dark:text-white/80">{detailPlanned.description}</p>
                </div>
              )}
              {detailPlanned.notes && (
                <div className="glass-card p-3 rounded-xl">
                  <p className="text-xs text-slate-400 dark:text-white/40 mb-0.5">Notes</p>
                  <p className="text-sm text-slate-700 dark:text-white/80">{detailPlanned.notes}</p>
                </div>
              )}
            </div>
          );
        })()}
      </Modal>

      {/* Transaction detail modal */}
      <Modal isOpen={!!detailTx} onClose={() => setDetailTx(null)} title="Transaction Details">
        {detailTx && (() => {
          const isExpense = detailTx._type === 'expense';
          const accentColor = isExpense ? 'text-expense' : 'text-income';
          const heroBg = isExpense ? 'bg-red-500/10 border-red-500/20' : 'bg-emerald-500/10 border-emerald-500/20';
          const proj = detailTx.effectiveFrom
            ? calculateProjection(detailTx.amount, detailTx.period, detailTx.effectiveFrom, detailTx.effectiveTo)
            : null;
          return (
            <div className="space-y-4">
              {/* Hero */}
              <div className={`flex items-center justify-between p-4 rounded-xl border ${heroBg}`}>
                <div className="flex items-center gap-3">
                  {isExpense ? (
                    <>
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: CATEGORY_COLORS[detailTx.category] || '#6366f1' }} />
                      <div>
                        <p className="text-xs text-slate-400 dark:text-white/40">Category</p>
                        <p className="text-base font-semibold text-slate-900 dark:text-white">{detailTx.category}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: INCOME_COLORS[detailTx.type] || '#10b981' }} />
                      <div>
                        <p className="text-xs text-slate-400 dark:text-white/40">Source</p>
                        <p className="text-base font-semibold text-slate-900 dark:text-white">{detailTx.type}</p>
                      </div>
                    </>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 dark:text-white/40">Amount</p>
                  <p className={`text-2xl font-bold ${accentColor}`}>
                    {isExpense ? '-' : '+'}{formatCurrency(detailTx.amount)}
                  </p>
                </div>
              </div>

              {/* Detail grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="glass-card p-3 rounded-xl">
                  <p className="text-xs text-slate-400 dark:text-white/40 mb-0.5">Date</p>
                  <p className="text-sm font-medium text-slate-800 dark:text-white">
                    {detailTx.date ? format(new Date(detailTx.date), 'dd MMM yyyy') : '—'}
                  </p>
                </div>
                <div className="glass-card p-3 rounded-xl">
                  <p className="text-xs text-slate-400 dark:text-white/40 mb-0.5">Period</p>
                  <p className="text-sm font-medium text-slate-800 dark:text-white capitalize">{detailTx.period || '—'}</p>
                </div>
                <div className="glass-card p-3 rounded-xl">
                  <p className="text-xs text-slate-400 dark:text-white/40 mb-0.5">Type</p>
                  <p className="text-sm font-medium text-slate-800 dark:text-white capitalize">{detailTx._type}</p>
                </div>
                <div className="glass-card p-3 rounded-xl">
                  <p className="text-xs text-slate-400 dark:text-white/40 mb-0.5">Family Member</p>
                  <p className="text-sm font-medium text-slate-800 dark:text-white">{detailTx.familyMemberName || 'Self'}</p>
                </div>
                {detailTx.effectiveFrom && (
                  <div className="glass-card p-3 rounded-xl col-span-2">
                    <p className="text-xs text-slate-400 dark:text-white/40 mb-0.5">Effective Range</p>
                    <p className="text-sm font-medium text-slate-800 dark:text-white">
                      {format(new Date(detailTx.effectiveFrom), 'dd MMM yy')}
                      {detailTx.effectiveTo
                        ? <> → {format(new Date(detailTx.effectiveTo), 'dd MMM yy')}</>
                        : <span className="text-purple-400"> → ongoing</span>}
                    </p>
                  </div>
                )}
              </div>

              {detailTx.description && (
                <div className="glass-card p-3 rounded-xl">
                  <p className="text-xs text-slate-400 dark:text-white/40 mb-0.5">Description</p>
                  <p className="text-sm text-slate-700 dark:text-white/80">{detailTx.description}</p>
                </div>
              )}

              {proj && (
                <ProjectionPanel
                  amount={detailTx.amount}
                  period={detailTx.period}
                  effectiveFrom={detailTx.effectiveFrom}
                  effectiveTo={detailTx.effectiveTo}
                  accentColor={isExpense ? 'text-red-400' : 'text-emerald-400'}
                />
              )}
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
