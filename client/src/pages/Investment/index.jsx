import { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Wallet, TrendingUp, Filter, CalendarRange } from 'lucide-react';
import { useSortable, SortIcon } from '../../hooks/useSortable';
import { useFinance } from '../../context/FinanceContext';
import Modal from '../../components/common/Modal';
import StatCard from '../../components/common/StatCard';
import ProjectionPanel from '../../components/common/ProjectionPanel';
import { formatCurrency, filterByPeriod, filterByFY, sumAmounts, INVESTMENT_COLORS, calculateProjection } from '../../utils/calculations';
import { format } from 'date-fns';

const INV_TYPES = ['Stocks','Mutual Funds','Fixed Deposit','Real Estate','Gold','Crypto','PPF','NPS','Insurance','Other'];
const PERIODS = ['daily','monthly','yearly'];
const STATUSES = ['active','matured','withdrawn'];

const today = new Date().toISOString().split('T')[0];
const emptyForm = {
  type: 'Mutual Funds', amount: '', expectedReturns: '', actualReturns: '',
  description: '', date: today, maturityDate: '',
  period: 'monthly', status: 'active',
  effectiveFrom: today, effectiveTo: '',
  familyMemberId: '', familyMemberName: ''
};

const STATUS_STYLES = {
  active: 'bg-emerald-500/20 text-emerald-400',
  matured: 'bg-blue-500/20 text-blue-400',
  withdrawn: 'bg-slate-500/20 text-slate-400',
};

export default function InvestmentPage() {
  const { investments, addInvestment, updateInvestment, deleteInvestment, familyMembers, period, financialYear } = useFinance();
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const filtered = useMemo(() => {
    let data = financialYear ? filterByFY(investments, financialYear) : filterByPeriod(investments, period);
    if (filterType) data = data.filter(i => i.type === filterType);
    if (filterStatus) data = data.filter(i => i.status === filterStatus);
    return data;
  }, [investments, period, financialYear, filterType, filterStatus]);

  const totalInvested = useMemo(() => sumAmounts(filtered), [filtered]);
  const { sorted, sortKey, sortDir, toggle } = useSortable(filtered, 'date', 'desc');
  const totalReturns = useMemo(() => filtered.reduce((s, i) => s + Number(i.actualReturns || 0), 0), [filtered]);
  const totalExpected = useMemo(() => filtered.reduce((s, i) => s + Number(i.expectedReturns || 0), 0), [filtered]);

  const openAdd = () => { setEditItem(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      type: item.type, amount: item.amount,
      expectedReturns: item.expectedReturns || '', actualReturns: item.actualReturns || '',
      description: item.description || '',
      date: item.date ? new Date(item.date).toISOString().split('T')[0] : today,
      maturityDate: item.maturityDate ? new Date(item.maturityDate).toISOString().split('T')[0] : '',
      period: item.period || 'monthly', status: item.status || 'active',
      effectiveFrom: item.effectiveFrom ? new Date(item.effectiveFrom).toISOString().split('T')[0] : today,
      effectiveTo: item.effectiveTo ? new Date(item.effectiveTo).toISOString().split('T')[0] : '',
      familyMemberId: item.familyMemberId || '', familyMemberName: item.familyMemberName || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const member = familyMembers.find(m => m._id === form.familyMemberId || m.id === form.familyMemberId);
    const payload = {
      ...form,
      amount: Number(form.amount),
      expectedReturns: Number(form.expectedReturns) || 0,
      actualReturns: Number(form.actualReturns) || 0,
      familyMemberName: member?.name || '',
      effectiveTo: form.effectiveTo || null,
    };
    try {
      if (editItem) await updateInvestment(editItem._id || editItem.id, payload);
      else await addInvestment(payload);
      setModalOpen(false);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this investment?')) await deleteInvestment(id);
  };

  const setField = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Invested" value={formatCurrency(totalInvested)} icon={Wallet} color="investment" subtitle={`${filtered.length} investments`} />
        <StatCard title="Actual Returns" value={formatCurrency(totalReturns)} icon={TrendingUp} color={totalReturns >= 0 ? 'income' : 'expense'} subtitle="Realized gains" />
        <StatCard title="Expected Returns" value={formatCurrency(totalExpected)} icon={TrendingUp} color="profit" subtitle="Projected gains" />
        <StatCard title="Net Position" value={formatCurrency(totalInvested + totalReturns)} icon={Wallet} color="primary" subtitle="Invested + Returns" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={15} className="text-slate-400 dark:text-white/40" />
          <select className="select-field w-auto text-sm py-2" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">All Types</option>
            {INV_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className="select-field w-auto text-sm py-2" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Status</option>
            {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
          </select>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Add Investment
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-200 dark:border-white/10">
              <tr>
                <th onClick={() => toggle('type')} className="table-header text-left px-5 py-4 cursor-pointer select-none hover:text-slate-900 dark:hover:text-white transition-colors">
                  <span className="flex items-center">Type <SortIcon col="type" sortKey={sortKey} sortDir={sortDir} /></span>
                </th>
                <th onClick={() => toggle('status')} className="table-header text-left px-5 py-4 hidden sm:table-cell cursor-pointer select-none hover:text-slate-900 dark:hover:text-white transition-colors">
                  <span className="flex items-center">Status <SortIcon col="status" sortKey={sortKey} sortDir={sortDir} /></span>
                </th>
                <th className="table-header text-left px-5 py-4 hidden md:table-cell">Effective Range</th>
                <th onClick={() => toggle('amount')} className="table-header text-right px-5 py-4 cursor-pointer select-none hover:text-slate-900 dark:hover:text-white transition-colors">
                  <span className="flex items-center justify-end">Invested <SortIcon col="amount" sortKey={sortKey} sortDir={sortDir} /></span>
                </th>
                <th onClick={() => toggle('actualReturns')} className="table-header text-right px-5 py-4 hidden lg:table-cell cursor-pointer select-none hover:text-slate-900 dark:hover:text-white transition-colors">
                  <span className="flex items-center justify-end">Returns <SortIcon col="actualReturns" sortKey={sortKey} sortDir={sortDir} /></span>
                </th>
                <th className="table-header text-right px-5 py-4 hidden xl:table-cell">Projected Remaining</th>
                <th className="table-header text-right px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-16 text-center text-slate-400 dark:text-white/30">No investments found. Start investing today!</td></tr>
              ) : sorted.map(item => {
                const proj = item.effectiveFrom
                  ? calculateProjection(item.amount, item.period, item.effectiveFrom, item.effectiveTo)
                  : null;
                return (
                  <tr key={item._id || item.id} className="table-row">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: INVESTMENT_COLORS[item.type] || '#6366f1' }} />
                        <span className="text-sm text-slate-700 dark:text-white/80">{item.type}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <span className={`badge capitalize ${STATUS_STYLES[item.status] || 'bg-slate-500/20 text-slate-400'}`}>{item.status}</span>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      {item.effectiveFrom ? (
                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-white/50">
                          <CalendarRange size={12} className="text-blue-400 flex-shrink-0" />
                          {format(new Date(item.effectiveFrom), 'dd MMM yy')}
                          {item.effectiveTo && <> → {format(new Date(item.effectiveTo), 'dd MMM yy')}</>}
                          {!item.effectiveTo && <span className="text-purple-400">→ ongoing</span>}
                        </div>
                      ) : <span className="text-slate-300 dark:text-white/25 text-xs">—</span>}
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold text-investment">{formatCurrency(item.amount)}</td>
                    <td className="px-5 py-3.5 hidden lg:table-cell text-right">
                      <span className={Number(item.actualReturns) >= 0 ? 'text-income' : 'text-expense'}>
                        {formatCurrency(item.actualReturns || 0)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 hidden xl:table-cell text-right">
                      {proj ? (
                        <span className={`text-sm font-medium ${proj.remainingAmount > 0 ? 'text-yellow-400' : 'text-slate-300 dark:text-white/30'}`}>
                          {proj.remainingAmount !== null ? formatCurrency(proj.remainingAmount) : '∞'}
                        </span>
                      ) : <span className="text-slate-300 dark:text-white/25 text-xs">—</span>}
                    </td>
                    <td className="px-5 py-3.5 text-right">
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Investment' : 'Add Investment'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Investment Type *</label>
              <select className="select-field" value={form.type} onChange={setField('type')} required>
                {INV_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Amount Invested (₹) *</label>
              <input type="number" className="input-field" placeholder="0.00" min="0" step="0.01" value={form.amount} onChange={setField('amount')} required />
            </div>
            <div>
              <label className="label">Expected Returns (₹)</label>
              <input type="number" className="input-field" placeholder="0.00" min="0" step="0.01" value={form.expectedReturns} onChange={setField('expectedReturns')} />
            </div>
            <div>
              <label className="label">Actual Returns (₹)</label>
              <input type="number" className="input-field" placeholder="0.00" step="0.01" value={form.actualReturns} onChange={setField('actualReturns')} />
            </div>
            <div>
              <label className="label">Start Date *</label>
              <input type="date" className="input-field" value={form.date} onChange={setField('date')} required />
            </div>
            <div>
              <label className="label">Maturity Date</label>
              <input type="date" className="input-field" value={form.maturityDate} onChange={setField('maturityDate')} />
            </div>

            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <CalendarRange size={14} className="text-blue-400" />
                <span className="text-sm font-medium text-slate-600 dark:text-white/70">Effective Date Range</span>
                <span className="text-xs text-slate-400 dark:text-white/30">(for projection of recurring contributions)</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">From *</label>
                  <input type="date" className="input-field" value={form.effectiveFrom} onChange={setField('effectiveFrom')} required />
                </div>
                <div>
                  <label className="label">To <span className="text-slate-400 dark:text-white/30">(blank = ongoing)</span></label>
                  <input type="date" className="input-field" value={form.effectiveTo} min={form.effectiveFrom || undefined} onChange={setField('effectiveTo')} />
                </div>
              </div>
            </div>

            <div>
              <label className="label">Status</label>
              <select className="select-field" value={form.status} onChange={setField('status')}>
                {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
              </select>
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
              <input type="text" className="input-field" placeholder="Investment details..." value={form.description} onChange={setField('description')} />
            </div>
          </div>

          {form.amount && form.effectiveFrom && (
            <ProjectionPanel
              amount={form.amount}
              period={form.period}
              effectiveFrom={form.effectiveFrom}
              effectiveTo={form.effectiveTo}
              accentColor="text-blue-400"
            />
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : editItem ? 'Update' : 'Add Investment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
