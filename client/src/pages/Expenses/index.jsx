import { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, TrendingDown, Filter, CalendarRange, Calendar, ArrowRight, Clock } from 'lucide-react';
import { useSortable, SortIcon } from '../../hooks/useSortable';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useFinance } from '../../context/FinanceContext';
import { useTheme } from '../../context/ThemeContext';
import Modal from '../../components/common/Modal';
import StatCard from '../../components/common/StatCard';
import ProjectionPanel from '../../components/common/ProjectionPanel';
import { formatCurrency, filterByPeriod, filterByFY, sumAmounts, groupByCategory, CATEGORY_COLORS, calculateProjection } from '../../utils/calculations';
import { format, isPast, isToday, differenceInDays } from 'date-fns';

const CATEGORIES = ['Kids','Education','Transport','Grocery','Entertainment','Maintenance','Furniture','Medicine','Functions','Celebrations','Insurance','Loan Repayment','Bills','Fuel and Gas','Outing','Party'];
const PERIODS = ['daily','monthly','yearly'];

const today = new Date().toISOString().split('T')[0];
const emptyForm = {
  category: 'Grocery', amount: '', description: '',
  date: today, period: 'monthly',
  effectiveFrom: today, effectiveTo: '',
  familyMemberId: '', familyMemberName: ''
};
const emptyPlannedForm = { category: 'Grocery', amount: '', description: '', effectiveDate: '', period: 'monthly', familyMemberId: '', familyMemberName: '', notes: '' };

function DueBadge({ effectiveDate }) {
  const date = new Date(effectiveDate);
  const due = isPast(date) || isToday(date);
  const days = differenceInDays(date, new Date());
  if (due) return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-400">Due</span>;
  if (days <= 7) return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400">In {days}d</span>;
  return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400">Upcoming</span>;
}

export default function ExpensesPage() {
  const { income, expenses, addExpense, updateExpense, deleteExpense, familyMembers, period, financialYear,
          plannedExpenses, addPlannedExpense, updatePlannedExpense, deletePlannedExpense, movePlannedToExpense } = useFinance();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [tab, setTab] = useState('actual');

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [filterCat, setFilterCat] = useState('');

  const [plannedModalOpen, setPlannedModalOpen] = useState(false);
  const [editPlanned, setEditPlanned] = useState(null);
  const [plannedForm, setPlannedForm] = useState(emptyPlannedForm);
  const [plannedSaving, setPlannedSaving] = useState(false);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [moveItem, setMoveItem] = useState(null);
  const [moveDate, setMoveDate] = useState('');
  const [moving, setMoving] = useState(false);

  const filtered = useMemo(() => {
    let data = financialYear ? filterByFY(expenses, financialYear) : filterByPeriod(expenses, period);
    if (filterCat) data = data.filter(e => e.category === filterCat);
    return data;
  }, [expenses, period, financialYear, filterCat]);

  const total = useMemo(() => sumAmounts(filtered), [filtered]);
  const categoryData = useMemo(() => groupByCategory(filtered), [filtered]);
  const { sorted, sortKey, sortDir, toggle } = useSortable(filtered, 'date', 'desc');
  const topCategory = [...categoryData].sort((a, b) => b.value - a.value)[0];

  const plannedTotal = useMemo(() => plannedExpenses.reduce((s, e) => s + e.amount, 0), [plannedExpenses]);
  const dueCount = useMemo(() => plannedExpenses.filter(e => isPast(new Date(e.effectiveDate)) || isToday(new Date(e.effectiveDate))).length, [plannedExpenses]);
  const netProfit = useMemo(() => {
    const applyFilter = (data) => financialYear ? filterByFY(data, financialYear) : filterByPeriod(data, period);
    return sumAmounts(applyFilter(income)) - sumAmounts(applyFilter(expenses));
  }, [income, expenses, period, financialYear]);
  const needToEarn = useMemo(() => Math.max(0, plannedTotal - Math.max(0, netProfit)), [plannedTotal, netProfit]);

  const tooltipStyle = useMemo(() => ({
    background: isDark ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.95)',
    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
    borderRadius: '12px',
    color: isDark ? 'white' : '#1e293b',
  }), [isDark]);

  const openAdd = () => { setEditItem(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      category: item.category, amount: item.amount, description: item.description || '',
      date: item.date ? new Date(item.date).toISOString().split('T')[0] : today,
      period: item.period || 'monthly',
      effectiveFrom: item.effectiveFrom ? new Date(item.effectiveFrom).toISOString().split('T')[0] : today,
      effectiveTo: item.effectiveTo ? new Date(item.effectiveTo).toISOString().split('T')[0] : '',
      familyMemberId: item.familyMemberId || '',
      familyMemberName: item.familyMemberName || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const member = familyMembers.find(m => m._id === form.familyMemberId || m.id === form.familyMemberId);
    const payload = { ...form, amount: Number(form.amount), familyMemberName: member?.name || '', effectiveTo: form.effectiveTo || null };
    try {
      if (editItem) await updateExpense(editItem._id || editItem.id, payload);
      else await addExpense(payload);
      setModalOpen(false);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this expense?')) await deleteExpense(id);
  };

  const openAddPlanned = () => { setEditPlanned(null); setPlannedForm(emptyPlannedForm); setPlannedModalOpen(true); };
  const openEditPlanned = (item) => {
    setEditPlanned(item);
    setPlannedForm({
      category: item.category, amount: item.amount, description: item.description || '',
      effectiveDate: item.effectiveDate ? new Date(item.effectiveDate).toISOString().split('T')[0] : '',
      period: item.period || 'monthly', familyMemberId: item.familyMemberId || '',
      familyMemberName: item.familyMemberName || '', notes: item.notes || '',
    });
    setPlannedModalOpen(true);
  };

  const handlePlannedSubmit = async (e) => {
    e.preventDefault();
    setPlannedSaving(true);
    const member = familyMembers.find(m => m._id === plannedForm.familyMemberId || m.id === plannedForm.familyMemberId);
    const payload = { ...plannedForm, amount: Number(plannedForm.amount), familyMemberName: member?.name || '' };
    try {
      if (editPlanned) await updatePlannedExpense(editPlanned._id || editPlanned.id, payload);
      else await addPlannedExpense(payload);
      setPlannedModalOpen(false);
    } finally { setPlannedSaving(false); }
  };

  const handleDeletePlanned = async (id) => {
    if (confirm('Delete this planned expense?')) await deletePlannedExpense(id);
  };

  const openMoveModal = (item) => {
    setMoveItem(item);
    setMoveDate(new Date(item.effectiveDate).toISOString().split('T')[0]);
    setMoveModalOpen(true);
  };

  const handleMove = async () => {
    if (!moveItem) return;
    setMoving(true);
    try {
      await movePlannedToExpense(moveItem._id || moveItem.id, moveDate);
      setMoveModalOpen(false);
      setTab('actual');
    } finally { setMoving(false); }
  };

  const setField = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));
  const setPlannedField = (f) => (e) => setPlannedForm(p => ({ ...p, [f]: e.target.value }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Tab switcher */}
      <div role="tablist" aria-label="Expense tabs" className="flex gap-2">
        <button
          role="tab"
          aria-selected={tab === 'actual'}
          aria-controls="panel-actual"
          id="tab-actual"
          onClick={() => setTab('actual')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'actual' ? 'bg-primary-500 text-white' : 'bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'}`}
        >
          Actual Expenses
        </button>
        <button
          role="tab"
          aria-selected={tab === 'planned'}
          aria-controls="panel-planned"
          id="tab-planned"
          onClick={() => setTab('planned')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${tab === 'planned' ? 'bg-primary-500 text-white' : 'bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'}`}
        >
          Planned Expenses
          {dueCount > 0 && (
            <span aria-label={`${dueCount} due`} className="px-1.5 py-0.5 rounded-full text-xs bg-red-500 text-white">{dueCount}</span>
          )}
        </button>
      </div>

      {tab === 'actual' && (
        <div id="panel-actual" role="tabpanel" aria-labelledby="tab-actual">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Expenses" value={formatCurrency(total)} icon={TrendingDown} color="expense" subtitle={`${filtered.length} entries`} />
            <StatCard title="Top Category" value={topCategory?.name || 'N/A'} icon={TrendingDown} color="expense" subtitle={topCategory ? formatCurrency(topCategory.value) : 'No data'} />
            <StatCard title="Avg per Entry" value={formatCurrency(filtered.length ? total / filtered.length : 0)} icon={TrendingDown} color="expense" subtitle="Average expense" />
            <StatCard title="Categories Used" value={categoryData.length} icon={TrendingDown} color="expense" subtitle={`of ${CATEGORIES.length} total`} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Category chart */}
            <div className="glass-card p-5">
              <h3 className="section-title mb-4">By Category</h3>
              {categoryData.length > 0 ? (
                <>
                  <div role="img" aria-label="Pie chart showing expense distribution by category">
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart aria-hidden="true">
                      <Pie data={categoryData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>
                        {categoryData.map(entry => <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || '#6366f1'} />)}
                      </Pie>
                      <Tooltip formatter={val => formatCurrency(val)} contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                  </div>
                  <div className="space-y-1.5 mt-3 max-h-48 overflow-y-auto">
                    {[...categoryData].sort((a,b) => b.value - a.value).map(item => (
                      <div key={item.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: CATEGORY_COLORS[item.name] || '#6366f1' }} />
                          <span className="text-slate-500 dark:text-white/60">{item.name}</span>
                        </div>
                        <span className="text-slate-900 dark:text-white font-medium">{formatCurrency(item.value)}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-48 flex items-center justify-center text-slate-400 dark:text-white/30 text-sm">No data yet</div>
              )}
            </div>

            {/* Table */}
            <div className="lg:col-span-2 glass-card overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <Filter size={15} aria-hidden="true" className="text-slate-400 dark:text-white/40" />
                  <label htmlFor="expense-filter-cat" className="sr-only">Filter by category</label>
                  <select id="expense-filter-cat" className="select-field w-auto text-sm py-2" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
                    <option value="">All Categories</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm">
                  <Plus aria-hidden="true" size={16} /> Add Expense
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-slate-200 dark:border-white/10">
                    <tr>
                      <th scope="col" onClick={() => toggle('category')} aria-sort={sortKey === 'category' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'} className="table-header text-left px-5 py-3 cursor-pointer select-none hover:text-slate-900 dark:hover:text-white transition-colors">
                        <span className="flex items-center">Category <SortIcon col="category" sortKey={sortKey} sortDir={sortDir} /></span>
                      </th>
                      <th scope="col" onClick={() => toggle('familyMemberName')} aria-sort={sortKey === 'familyMemberName' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'} className="table-header text-left px-5 py-3 hidden sm:table-cell cursor-pointer select-none hover:text-slate-900 dark:hover:text-white transition-colors">
                        <span className="flex items-center">Member <SortIcon col="familyMemberName" sortKey={sortKey} sortDir={sortDir} /></span>
                      </th>
                      <th scope="col" className="table-header text-left px-5 py-3 hidden md:table-cell">Effective Range</th>
                      <th scope="col" onClick={() => toggle('amount')} aria-sort={sortKey === 'amount' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'} className="table-header text-right px-5 py-3 cursor-pointer select-none hover:text-slate-900 dark:hover:text-white transition-colors">
                        <span className="flex items-center justify-end">Amount <SortIcon col="amount" sortKey={sortKey} sortDir={sortDir} /></span>
                      </th>
                      <th scope="col" className="table-header text-right px-5 py-3 hidden lg:table-cell">Remaining</th>
                      <th scope="col" className="table-header text-right px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.length === 0 ? (
                      <tr><td colSpan={6} className="px-5 py-16 text-center text-slate-400 dark:text-white/30">No expenses found. Add your first entry!</td></tr>
                    ) : sorted.map(item => {
                      const proj = item.effectiveFrom
                        ? calculateProjection(item.amount, item.period, item.effectiveFrom, item.effectiveTo)
                        : null;
                      return (
                        <tr key={item._id || item.id} className="table-row">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[item.category] || '#6366f1' }} />
                              <span className="text-sm text-slate-700 dark:text-white/80">{item.category}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 hidden sm:table-cell text-sm text-slate-500 dark:text-white/50">{item.familyMemberName || 'Self'}</td>
                          <td className="px-5 py-3 hidden md:table-cell">
                            {item.effectiveFrom ? (
                              <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-white/50">
                                <CalendarRange aria-hidden="true" size={12} className="text-red-400 flex-shrink-0" />
                                {format(new Date(item.effectiveFrom), 'dd MMM yy')}
                                {item.effectiveTo && <> → {format(new Date(item.effectiveTo), 'dd MMM yy')}</>}
                                {!item.effectiveTo && <span className="text-purple-400">→ ongoing</span>}
                              </div>
                            ) : <span className="text-slate-300 dark:text-white/25 text-xs">—</span>}
                          </td>
                          <td className="px-5 py-3 text-right font-semibold text-expense">{formatCurrency(item.amount)}</td>
                          <td className="px-5 py-3 hidden lg:table-cell text-right">
                            {proj ? (
                              <span className={`text-sm font-medium ${proj.remainingAmount > 0 ? 'text-yellow-400' : 'text-slate-300 dark:text-white/30'}`}>
                                {proj.remainingAmount !== null ? formatCurrency(proj.remainingAmount) : '∞'}
                              </span>
                            ) : <span className="text-slate-300 dark:text-white/25 text-xs">—</span>}
                          </td>
                          <td className="px-5 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 dark:text-white/40 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"><Edit2 size={14} /></button>
                              <button onClick={() => handleDelete(item._id || item.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 dark:text-white/40 hover:text-red-500 dark:hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'planned' && (
        <div id="panel-planned" role="tabpanel" aria-labelledby="tab-planned">
          {/* Planned stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Planned" value={formatCurrency(plannedTotal)} icon={Calendar} color="expense" subtitle={`${plannedExpenses.length} planned`} />
            <StatCard title="Due Now" value={dueCount} icon={Clock} color="expense" subtitle="Ready to mark done" />
            <StatCard title="Need to Earn" value={formatCurrency(needToEarn)} icon={TrendingDown} color={needToEarn === 0 ? 'income' : 'expense'} subtitle={needToEarn === 0 ? 'Covered by net profit' : 'Still needed beyond profit'} />
            <StatCard title="Upcoming" value={plannedExpenses.length - dueCount} icon={Calendar} color="income" subtitle="Future expenses" />
          </div>

          {/* Need-to-earn banner */}
          {plannedExpenses.length > 0 && (
            <div className={`glass-card p-4 border ${needToEarn === 0 ? 'border-green-500/20 bg-green-500/5' : 'border-primary-500/20 bg-primary-500/5'}`}>
              <div className="flex items-center justify-between">
                <div>
                  {needToEarn === 0 ? (
                    <>
                      <p className="text-sm text-slate-500 dark:text-white/60">Your net profit covers all planned expenses</p>
                      <p className="text-2xl font-bold text-green-400">{formatCurrency(plannedTotal)}</p>
                      <p className="text-xs text-slate-400 dark:text-white/40 mt-0.5">covered — surplus of {formatCurrency(netProfit - plannedTotal)}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-slate-500 dark:text-white/60">You still need to earn</p>
                      <p className="text-2xl font-bold text-primary-500 dark:text-primary-400">{formatCurrency(needToEarn)}</p>
                      <p className="text-xs text-slate-400 dark:text-white/40 mt-0.5">after your net profit of {formatCurrency(netProfit)} to cover {plannedExpenses.length} planned expense{plannedExpenses.length !== 1 ? 's' : ''}</p>
                    </>
                  )}
                </div>
                {dueCount > 0 && (
                  <div className="text-right">
                    <p className="text-sm text-red-400 font-semibold">{dueCount} expense{dueCount !== 1 ? 's' : ''} due</p>
                    <p className="text-xs text-slate-400 dark:text-white/40">Effective date reached — ready to move</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Planned table */}
          <div className="glass-card overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-white/10">
              <h3 className="section-title">Planned Expenses</h3>
              <button onClick={openAddPlanned} className="btn-primary flex items-center gap-2 text-sm">
                <Plus aria-hidden="true" size={16} /> Add Planned
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 dark:border-white/10">
                  <tr>
                    <th scope="col" className="table-header text-left px-5 py-3">Category</th>
                    <th scope="col" className="table-header text-left px-5 py-3 hidden sm:table-cell">Member</th>
                    <th scope="col" className="table-header text-left px-5 py-3">Effective Date</th>
                    <th scope="col" className="table-header text-left px-5 py-3 hidden md:table-cell">Status</th>
                    <th scope="col" className="table-header text-left px-5 py-3 hidden lg:table-cell">Notes</th>
                    <th scope="col" className="table-header text-right px-5 py-3">Amount</th>
                    <th scope="col" className="table-header text-right px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {plannedExpenses.length === 0 ? (
                    <tr><td colSpan={7} className="px-5 py-16 text-center text-slate-400 dark:text-white/30">No planned expenses. Add future expenses to track what you need to earn.</td></tr>
                  ) : (
                    plannedExpenses.map(item => (
                      <tr key={item._id || item.id} className="table-row">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[item.category] || '#6366f1' }} />
                            <span className="text-sm text-slate-700 dark:text-white/80">{item.category}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 hidden sm:table-cell text-sm text-slate-500 dark:text-white/50">{item.familyMemberName || 'Self'}</td>
                        <td className="px-5 py-3 text-sm text-slate-500 dark:text-white/50">
                          {item.effectiveDate ? format(new Date(item.effectiveDate), 'dd MMM yyyy') : '-'}
                        </td>
                        <td className="px-5 py-3 hidden md:table-cell">
                          {item.effectiveDate && <DueBadge effectiveDate={item.effectiveDate} />}
                        </td>
                        <td className="px-5 py-3 hidden lg:table-cell text-sm text-slate-500 dark:text-white/50 max-w-xs truncate">{item.notes || item.description || '-'}</td>
                        <td className="px-5 py-3 text-right font-semibold text-expense">{formatCurrency(item.amount)}</td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openMoveModal(item)}
                              aria-label="Mark as done — move to actual expenses"
                              className="p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-500/10 text-slate-400 dark:text-white/40 hover:text-green-500 dark:hover:text-green-400 transition-colors"
                            >
                              <ArrowRight aria-hidden="true" size={14} />
                            </button>
                            <button onClick={() => openEditPlanned(item)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 dark:text-white/40 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"><Edit2 size={14} /></button>
                            <button onClick={() => handleDeletePlanned(item._id || item.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 dark:text-white/40 hover:text-red-500 dark:hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Actual expense modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Expense' : 'Add Expense'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="expense-category" className="label">Category *</label>
              <select id="expense-category" className="select-field" value={form.category} onChange={setField('category')} required>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="expense-amount" className="label">Amount (₹) *</label>
              <input id="expense-amount" type="number" className="input-field" placeholder="0.00" min="0" step="0.01" value={form.amount} onChange={setField('amount')} required />
            </div>
            <div>
              <label htmlFor="expense-date" className="label">Transaction Date *</label>
              <input id="expense-date" type="date" className="input-field" value={form.date} onChange={setField('date')} required />
            </div>
            <div>
              <label htmlFor="expense-period" className="label">Period</label>
              <select id="expense-period" className="select-field" value={form.period} onChange={setField('period')}>
                {PERIODS.map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
              </select>
            </div>

            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <CalendarRange size={14} aria-hidden="true" className="text-red-400" />
                <span className="text-sm font-medium text-slate-600 dark:text-white/70">Effective Date Range</span>
                <span className="text-xs text-slate-400 dark:text-white/30">(for projection)</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="expense-effective-from" className="label">From *</label>
                  <input id="expense-effective-from" type="date" className="input-field" value={form.effectiveFrom} onChange={setField('effectiveFrom')} required />
                </div>
                <div>
                  <label htmlFor="expense-effective-to" className="label">To <span className="text-slate-400 dark:text-white/30">(blank = ongoing)</span></label>
                  <input id="expense-effective-to" type="date" className="input-field" value={form.effectiveTo} min={form.effectiveFrom || undefined} onChange={setField('effectiveTo')} />
                </div>
              </div>
            </div>

            <div className="col-span-2">
              <label htmlFor="expense-member" className="label">Family Member</label>
              <select id="expense-member" className="select-field" value={form.familyMemberId} onChange={setField('familyMemberId')}>
                <option value="">Self / All Family</option>
                {familyMembers.map(m => <option key={m._id || m.id} value={m._id || m.id}>{m.name} ({m.relationship})</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label htmlFor="expense-description" className="label">Description</label>
              <input id="expense-description" type="text" className="input-field" placeholder="What was this expense for?" value={form.description} onChange={setField('description')} />
            </div>
          </div>

          {form.amount && form.effectiveFrom && (
            <ProjectionPanel
              amount={form.amount}
              period={form.period}
              effectiveFrom={form.effectiveFrom}
              effectiveTo={form.effectiveTo}
              accentColor="text-red-400"
            />
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : editItem ? 'Update' : 'Add Expense'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Planned expense modal */}
      <Modal isOpen={plannedModalOpen} onClose={() => setPlannedModalOpen(false)} title={editPlanned ? 'Edit Planned Expense' : 'Add Planned Expense'}>
        <form onSubmit={handlePlannedSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="planned-category" className="label">Category *</label>
              <select id="planned-category" className="select-field" value={plannedForm.category} onChange={setPlannedField('category')} required>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="planned-amount" className="label">Amount *</label>
              <input id="planned-amount" type="number" className="input-field" placeholder="0.00" min="0" step="0.01" value={plannedForm.amount} onChange={setPlannedField('amount')} required />
            </div>
            <div>
              <label htmlFor="planned-effective-date" className="label">Effective Date *</label>
              <input id="planned-effective-date" type="date" className="input-field" value={plannedForm.effectiveDate} onChange={setPlannedField('effectiveDate')} required />
            </div>
            <div>
              <label htmlFor="planned-period" className="label">Period</label>
              <select id="planned-period" className="select-field" value={plannedForm.period} onChange={setPlannedField('period')}>
                {PERIODS.map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label htmlFor="planned-member" className="label">Family Member</label>
              <select id="planned-member" className="select-field" value={plannedForm.familyMemberId} onChange={setPlannedField('familyMemberId')}>
                <option value="">Self / All Family</option>
                {familyMembers.map(m => <option key={m._id || m.id} value={m._id || m.id}>{m.name} ({m.relationship})</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label htmlFor="planned-description" className="label">Description</label>
              <input id="planned-description" type="text" className="input-field" placeholder="What is this expense for?" value={plannedForm.description} onChange={setPlannedField('description')} />
            </div>
            <div className="col-span-2">
              <label htmlFor="planned-notes" className="label">Notes</label>
              <input id="planned-notes" type="text" className="input-field" placeholder="Any additional notes..." value={plannedForm.notes} onChange={setPlannedField('notes')} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setPlannedModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={plannedSaving} className="btn-primary flex-1">
              {plannedSaving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : editPlanned ? 'Update' : 'Add Planned'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Move to expense confirmation modal */}
      <Modal isOpen={moveModalOpen} onClose={() => setMoveModalOpen(false)} title="Move to Expenses">
        <div className="space-y-4">
          {moveItem && (
            <div className="glass-card p-4 rounded-xl space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[moveItem.category] || '#6366f1' }} />
                <span className="text-slate-900 dark:text-white font-medium">{moveItem.category}</span>
                <span className="ml-auto font-bold text-expense">{formatCurrency(moveItem.amount)}</span>
              </div>
              {moveItem.description && <p className="text-sm text-slate-500 dark:text-white/50">{moveItem.description}</p>}
            </div>
          )}
          <div>
            <label htmlFor="move-expense-date" className="label">Actual Expense Date *</label>
            <input id="move-expense-date" type="date" className="input-field" value={moveDate} onChange={e => setMoveDate(e.target.value)} required />
          </div>
          <p className="text-xs text-slate-400 dark:text-white/40">This will remove the item from Planned Expenses and add it to your Actual Expenses.</p>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setMoveModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleMove} disabled={moving || !moveDate} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {moving
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><ArrowRight aria-hidden="true" size={16} /> Mark as Done</>}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
