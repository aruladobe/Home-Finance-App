import { useState } from 'react';
import { CreditCard, TrendingUp, Repeat, Percent } from 'lucide-react';
import { formatCurrency } from '../../utils/calculations';

const TABS = [
  { id: 'emi', label: 'EMI', icon: CreditCard },
  { id: 'si', label: 'Simple Interest', icon: TrendingUp },
  { id: 'ci', label: 'Compound Interest', icon: Repeat },
  { id: 'percent', label: 'Percentage', icon: Percent },
];

function EMICalculator() {
  const [form, setForm] = useState({ principal: '', rate: '', tenure: '' });
  const [result, setResult] = useState(null);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const calculate = () => {
    const P = Number(form.principal);
    const r = Number(form.rate) / 12 / 100;
    const n = Number(form.tenure);
    if (!P || !form.rate || !n) return;
    const emi = r === 0 ? P / n : (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const total = emi * n;
    const interest = total - P;

    let balance = P;
    const schedule = Array.from({ length: n }, (_, i) => {
      const int = balance * r;
      const prin = emi - int;
      balance = Math.max(0, balance - prin);
      return { month: i + 1, emi, principal: prin, interest: int, balance };
    });

    setResult({ emi, total, interest, schedule });
  };

  const reset = () => { setForm({ principal: '', rate: '', tenure: '' }); setResult(null); };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="label">Loan Amount (₹) *</label>
          <input type="number" className="input-field" placeholder="e.g. 5,00,000" min="0" value={form.principal} onChange={set('principal')} />
        </div>
        <div>
          <label className="label">Annual Interest Rate (%) *</label>
          <input type="number" className="input-field" placeholder="e.g. 8.5" min="0" step="0.1" value={form.rate} onChange={set('rate')} />
        </div>
        <div>
          <label className="label">Tenure (Months) *</label>
          <input type="number" className="input-field" placeholder="e.g. 60" min="1" value={form.tenure} onChange={set('tenure')} />
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={calculate} className="btn-primary">Calculate EMI</button>
        <button onClick={reset} className="btn-secondary">Reset</button>
      </div>

      {result && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-card p-5 bg-gradient-to-br from-primary-500/15 to-purple-600/10 border-primary-500/20">
              <p className="text-xs text-slate-500 dark:text-white/50 mb-1">Monthly EMI</p>
              <p className="text-2xl font-bold text-primary-500 dark:text-primary-400">{formatCurrency(result.emi)}</p>
            </div>
            <div className="glass-card p-5 bg-gradient-to-br from-emerald-500/15 to-emerald-600/10 border-emerald-500/20">
              <p className="text-xs text-slate-500 dark:text-white/50 mb-1">Total Amount Payable</p>
              <p className="text-2xl font-bold text-emerald-400">{formatCurrency(result.total)}</p>
            </div>
            <div className="glass-card p-5 bg-gradient-to-br from-red-500/15 to-red-600/10 border-red-500/20">
              <p className="text-xs text-slate-500 dark:text-white/50 mb-1">Total Interest</p>
              <p className="text-2xl font-bold text-red-400">{formatCurrency(result.interest)}</p>
            </div>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-600 dark:text-white/70">Amortization Schedule</h4>
              <span className="text-xs text-slate-400 dark:text-white/30">Showing first 12 months</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200 dark:border-white/10">
                  <tr>
                    <th className="table-header text-left px-5 py-3">Month</th>
                    <th className="table-header text-right px-5 py-3">EMI</th>
                    <th className="table-header text-right px-5 py-3">Principal</th>
                    <th className="table-header text-right px-5 py-3">Interest</th>
                    <th className="table-header text-right px-5 py-3">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {result.schedule.slice(0, 12).map(row => (
                    <tr key={row.month} className="table-row">
                      <td className="px-5 py-2.5 text-slate-500 dark:text-white/60">{row.month}</td>
                      <td className="px-5 py-2.5 text-right text-slate-900 dark:text-white">{formatCurrency(row.emi)}</td>
                      <td className="px-5 py-2.5 text-right text-emerald-400">{formatCurrency(row.principal)}</td>
                      <td className="px-5 py-2.5 text-right text-red-400">{formatCurrency(row.interest)}</td>
                      <td className="px-5 py-2.5 text-right text-slate-500 dark:text-white/60">{formatCurrency(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SICalculator() {
  const [form, setForm] = useState({ principal: '', rate: '', tenure: '' });
  const [result, setResult] = useState(null);
  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const calculate = () => {
    const P = Number(form.principal);
    const R = Number(form.rate);
    const T = Number(form.tenure) / 12;
    if (!P || !R || !T) return;
    const si = (P * R * T) / 100;
    setResult({ si, total: P + si, ratePerMonth: R / 12 });
  };
  const reset = () => { setForm({ principal: '', rate: '', tenure: '' }); setResult(null); };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="label">Principal Amount (₹) *</label>
          <input type="number" className="input-field" placeholder="e.g. 1,00,000" min="0" value={form.principal} onChange={set('principal')} />
        </div>
        <div>
          <label className="label">Annual Interest Rate (%) *</label>
          <input type="number" className="input-field" placeholder="e.g. 7" min="0" step="0.1" value={form.rate} onChange={set('rate')} />
        </div>
        <div>
          <label className="label">Tenure (Months) *</label>
          <input type="number" className="input-field" placeholder="e.g. 24" min="1" value={form.tenure} onChange={set('tenure')} />
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={calculate} className="btn-primary">Calculate</button>
        <button onClick={reset} className="btn-secondary">Reset</button>
      </div>
      {result && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-card p-5 bg-gradient-to-br from-amber-500/15 to-amber-600/10 border-amber-500/20">
              <p className="text-xs text-slate-500 dark:text-white/50 mb-1">Simple Interest</p>
              <p className="text-2xl font-bold text-amber-400">{formatCurrency(result.si)}</p>
            </div>
            <div className="glass-card p-5 bg-gradient-to-br from-emerald-500/15 to-emerald-600/10 border-emerald-500/20">
              <p className="text-xs text-slate-500 dark:text-white/50 mb-1">Total Amount</p>
              <p className="text-2xl font-bold text-emerald-400">{formatCurrency(result.total)}</p>
            </div>
            <div className="glass-card p-5 bg-gradient-to-br from-blue-500/15 to-blue-600/10 border-blue-500/20">
              <p className="text-xs text-slate-500 dark:text-white/50 mb-1">Monthly Rate</p>
              <p className="text-2xl font-bold text-blue-400">{result.ratePerMonth.toFixed(4)}%</p>
            </div>
          </div>
          <div className="glass-card p-5">
            <p className="text-xs text-slate-400 dark:text-white/40 font-mono">SI = (P × R × T) / 100 = ({formatCurrency(Number(form.principal))} × {form.rate}% × {(Number(form.tenure)/12).toFixed(2)} yrs) / 100 = {formatCurrency(result.si)}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function CICalculator() {
  const [form, setForm] = useState({ principal: '', rate: '', tenure: '', freq: '12' });
  const [result, setResult] = useState(null);
  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const calculate = () => {
    const P = Number(form.principal);
    const R = Number(form.rate) / 100;
    const n = Number(form.freq);
    const t = Number(form.tenure) / 12;
    if (!P || !R || !t) return;
    const A = P * Math.pow(1 + R / n, n * t);
    const ci = A - P;
    setResult({ ci, total: A });
  };
  const reset = () => { setForm({ principal: '', rate: '', tenure: '', freq: '12' }); setResult(null); };

  const freqLabels = { '12': 'Monthly', '4': 'Quarterly', '2': 'Half-Yearly', '1': 'Yearly' };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Principal Amount (₹) *</label>
          <input type="number" className="input-field" placeholder="e.g. 1,00,000" min="0" value={form.principal} onChange={set('principal')} />
        </div>
        <div>
          <label className="label">Annual Interest Rate (%) *</label>
          <input type="number" className="input-field" placeholder="e.g. 8" min="0" step="0.1" value={form.rate} onChange={set('rate')} />
        </div>
        <div>
          <label className="label">Tenure (Months) *</label>
          <input type="number" className="input-field" placeholder="e.g. 36" min="1" value={form.tenure} onChange={set('tenure')} />
        </div>
        <div>
          <label className="label">Compounding Frequency</label>
          <select className="select-field" value={form.freq} onChange={set('freq')}>
            <option value="12">Monthly</option>
            <option value="4">Quarterly</option>
            <option value="2">Half-Yearly</option>
            <option value="1">Yearly</option>
          </select>
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={calculate} className="btn-primary">Calculate</button>
        <button onClick={reset} className="btn-secondary">Reset</button>
      </div>
      {result && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-card p-5 bg-gradient-to-br from-purple-500/15 to-purple-600/10 border-purple-500/20">
              <p className="text-xs text-slate-500 dark:text-white/50 mb-1">Compound Interest</p>
              <p className="text-2xl font-bold text-purple-400">{formatCurrency(result.ci)}</p>
            </div>
            <div className="glass-card p-5 bg-gradient-to-br from-emerald-500/15 to-emerald-600/10 border-emerald-500/20">
              <p className="text-xs text-slate-500 dark:text-white/50 mb-1">Total Amount</p>
              <p className="text-2xl font-bold text-emerald-400">{formatCurrency(result.total)}</p>
            </div>
          </div>
          <div className="glass-card p-5">
            <p className="text-xs text-slate-400 dark:text-white/40 font-mono">
              A = P × (1 + r/n)^(n×t) · Compounded {freqLabels[form.freq]} · {(Number(form.tenure)/12).toFixed(2)} yrs
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function PercentCalculator() {
  const [mode, setMode] = useState('whatIs');
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [result, setResult] = useState(null);

  const MODES = [
    { id: 'whatIs', label: 'What is X% of Y?',    aLabel: 'Percentage X (%)', bLabel: 'Value Y' },
    { id: 'isWhat', label: 'X is what % of Y?',   aLabel: 'Value X',          bLabel: 'Total Y' },
    { id: 'change', label: '% Change (X → Y)',     aLabel: 'Original Value X', bLabel: 'New Value Y' },
  ];
  const current = MODES.find(m => m.id === mode);

  const calculate = () => {
    const A = Number(a), B = Number(b);
    if (!A || !B) return;
    if (mode === 'whatIs') setResult({ label: `${A}% of ${formatCurrency(B)}`, value: (A / 100) * B, isCurrency: true });
    else if (mode === 'isWhat') setResult({ label: `${formatCurrency(A)} is % of ${formatCurrency(B)}`, value: (A / B) * 100, isCurrency: false });
    else setResult({ label: `% change from ${formatCurrency(A)} to ${formatCurrency(B)}`, value: ((B - A) / A) * 100, isCurrency: false });
  };
  const reset = () => { setA(''); setB(''); setResult(null); };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {MODES.map(m => (
          <button key={m.id} onClick={() => { setMode(m.id); setResult(null); setA(''); setB(''); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
              mode === m.id
                ? 'bg-primary-600/30 text-slate-900 dark:text-white border-primary-500/30'
                : 'bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/10 border-slate-200 dark:border-white/10'
            }`}>
            {m.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">{current.aLabel} *</label>
          <input type="number" className="input-field" placeholder="Enter value" value={a} onChange={e => setA(e.target.value)} />
        </div>
        <div>
          <label className="label">{current.bLabel} *</label>
          <input type="number" className="input-field" placeholder="Enter value" value={b} onChange={e => setB(e.target.value)} />
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={calculate} className="btn-primary">Calculate</button>
        <button onClick={reset} className="btn-secondary">Reset</button>
      </div>

      {result && (
        <div className="glass-card p-6 bg-gradient-to-br from-cyan-500/15 to-cyan-600/10 border-cyan-500/20 animate-fade-in">
          <p className="text-xs text-slate-500 dark:text-white/50 mb-2">{result.label}</p>
          <p className={`text-3xl font-bold ${result.value < 0 ? 'text-red-400' : 'text-cyan-400'}`}>
            {result.isCurrency
              ? formatCurrency(result.value)
              : `${result.value >= 0 ? '+' : ''}${result.value.toFixed(2)}%`}
          </p>
        </div>
      )}
    </div>
  );
}

const COMPONENTS = { emi: EMICalculator, si: SICalculator, ci: CICalculator, percent: PercentCalculator };

export default function CalculatorPage() {
  const [activeTab, setActiveTab] = useState('emi');
  const ActiveComponent = COMPONENTS[activeTab];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Financial Calculator</h2>
        <p className="text-sm text-slate-400 dark:text-white/40 mt-1">EMI, interest & percentage calculations</p>
      </div>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-2 p-1 glass-card w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === id
                ? 'bg-gradient-to-r from-primary-600/40 to-purple-600/30 text-slate-900 dark:text-white border border-primary-500/30'
                : 'text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Active calculator */}
      <div className="glass-card p-6">
        <ActiveComponent />
      </div>
    </div>
  );
}
