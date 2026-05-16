import { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, TrendingDown, Filter } from 'lucide-react';
import { useSortable, SortIcon } from '../../hooks/useSortable';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useFinance } from '../../context/FinanceContext';
import Modal from '../../components/common/Modal';
import StatCard from '../../components/common/StatCard';
import { formatCurrency, filterByPeriod, sumAmounts, groupByCategory, CATEGORY_COLORS } from '../../utils/calculations';
import { format } from 'date-fns';

const CATEGORIES = ['Kids','Education','Transport','Grocery','Entertainment','Maintenance','Furniture','Medicine','Functions','Celebrations','Insurance'];
const PERIODS = ['daily','monthly','yearly'];

const emptyForm = { category: 'Grocery', amount: '', description: '', date: new Date().toISOString().split('T')[0], period: 'monthly', familyMemberId: '', familyMemberName: '' };

export default function ExpensesPage() {
  const { expenses, addExpense, updateExpense, deleteExpense, familyMembers, period } = useFinance();
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [filterCat, setFilterCat] = useState('');

  const filtered = useMemo(() => {
    let data = filterByPeriod(expenses, period);
    if (filterCat) data = data.filter(e => e.category === filterCat);
    return data;
  }, [expenses, period, filterCat]);

  const total = useMemo(() => sumAmounts(filtered), [filtered]);
  const categoryData = useMemo(() => groupByCategory(filtered), [filtered]);
  const { sorted, sortKey, sortDir, toggle } = useSortable(filtered, 'date', 'desc');
  const topCategory = categoryData.sort((a, b) => b.value - a.value)[0];

  const openAdd = () => { setEditItem(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      category: item.category, amount: item.amount, description: item.description || '',
      date: item.date ? new Date(item.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      period: item.period || 'monthly', familyMemberId: item.familyMemberId || '', familyMemberName: item.familyMemberName || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const member = familyMembers.find(m => m._id === form.familyMemberId || m.id === form.familyMemberId);
    const payload = { ...form, amount: Number(form.amount), familyMemberName: member?.name || '' };
    try {
      if (editItem) await updateExpense(editItem._id || editItem.id, payload);
      else await addExpense(payload);
      setModalOpen(false);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this expense?')) await deleteExpense(id);
  };

  const setField = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));

  return (
    <div className="space-y-6 animate-fade-in">
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
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>
                    {categoryData.map(entry => <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || '#6366f1'} />)}
                  </Pie>
                  <Tooltip formatter={val => formatCurrency(val)} contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-3 max-h-48 overflow-y-auto">
                {categoryData.sort((a,b) => b.value - a.value).map(item => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: CATEGORY_COLORS[item.name] || '#6366f1' }} />
                      <span className="text-white/60">{item.name}</span>
                    </div>
                    <span className="text-white font-medium">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-48 flex items-center justify-center text-white/30 text-sm">No data yet</div>
          )}
        </div>

        {/* Table */}
        <div className="lg:col-span-2 glass-card overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Filter size={15} className="text-white/40" />
              <select className="select-field w-auto text-sm py-2" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
                <option value="">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm">
              <Plus size={16} /> Add Expense
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/10">
                <tr>
                  <th onClick={() => toggle('category')} className="table-header text-left px-5 py-3 cursor-pointer select-none hover:text-white transition-colors">
                    <span className="flex items-center">Category <SortIcon col="category" sortKey={sortKey} sortDir={sortDir} /></span>
                  </th>
                  <th onClick={() => toggle('familyMemberName')} className="table-header text-left px-5 py-3 hidden sm:table-cell cursor-pointer select-none hover:text-white transition-colors">
                    <span className="flex items-center">Member <SortIcon col="familyMemberName" sortKey={sortKey} sortDir={sortDir} /></span>
                  </th>
                  <th onClick={() => toggle('date')} className="table-header text-left px-5 py-3 hidden md:table-cell cursor-pointer select-none hover:text-white transition-colors">
                    <span className="flex items-center">Date <SortIcon col="date" sortKey={sortKey} sortDir={sortDir} /></span>
                  </th>
                  <th className="table-header text-left px-5 py-3 hidden lg:table-cell">Description</th>
                  <th onClick={() => toggle('amount')} className="table-header text-right px-5 py-3 cursor-pointer select-none hover:text-white transition-colors">
                    <span className="flex items-center justify-end">Amount <SortIcon col="amount" sortKey={sortKey} sortDir={sortDir} /></span>
                  </th>
                  <th className="table-header text-right px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.length === 0 ? (
                  <tr><td colSpan={6} className="px-5 py-16 text-center text-white/30">No expenses found. Add your first entry!</td></tr>
                ) : (
                  sorted.map(item => (
                    <tr key={item._id || item.id} className="table-row">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[item.category] || '#6366f1' }} />
                          <span className="text-sm text-white/80">{item.category}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 hidden sm:table-cell text-sm text-white/50">{item.familyMemberName || 'Self'}</td>
                      <td className="px-5 py-3 hidden md:table-cell text-sm text-white/50">{item.date ? format(new Date(item.date), 'dd MMM yyyy') : '-'}</td>
                      <td className="px-5 py-3 hidden lg:table-cell text-sm text-white/50 max-w-xs truncate">{item.description || '-'}</td>
                      <td className="px-5 py-3 text-right font-semibold text-expense">{formatCurrency(item.amount)}</td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-primary-400 transition-colors"><Edit2 size={14} /></button>
                          <button onClick={() => handleDelete(item._id || item.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Expense' : 'Add Expense'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category *</label>
              <select className="select-field" value={form.category} onChange={setField('category')} required>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Amount *</label>
              <input type="number" className="input-field" placeholder="0.00" min="0" step="0.01" value={form.amount} onChange={setField('amount')} required />
            </div>
            <div>
              <label className="label">Date *</label>
              <input type="date" className="input-field" value={form.date} onChange={setField('date')} required />
            </div>
            <div>
              <label className="label">Period</label>
              <select className="select-field" value={form.period} onChange={setField('period')}>
                {PERIODS.map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="label">Family Member</label>
              <select className="select-field" value={form.familyMemberId} onChange={setField('familyMemberId')}>
                <option value="">Self / All Family</option>
                {familyMembers.map(m => <option key={m._id || m.id} value={m._id || m.id}>{m.name} ({m.relationship})</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="label">Description</label>
              <input type="text" className="input-field" placeholder="What was this expense for?" value={form.description} onChange={setField('description')} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : editItem ? 'Update' : 'Add Expense'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
