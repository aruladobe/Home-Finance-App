import { useState, useMemo } from 'react';
import { Download, FileText, FileSpreadsheet, Calendar, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import Modal from './Modal';
import { PRESET_OPTIONS, getDateRange, downloadPDF, downloadCSV } from '../../utils/statementGenerator';
import { formatCurrency } from '../../utils/calculations';

function previewCount(items, from, to) {
  return items.filter(item => {
    const d = item.date ? new Date(item.date) : null;
    return d && d >= from && d <= to;
  }).length;
}

function previewSum(items, from, to) {
  return items
    .filter(item => { const d = item.date ? new Date(item.date) : null; return d && d >= from && d <= to; })
    .reduce((s, i) => s + Number(i.amount || 0), 0);
}

export default function StatementDownloadModal({ isOpen, onClose, income, expenses, investments, userName, activeFY }) {
  const [preset, setPreset]       = useState('last3m');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo]   = useState('');
  const [fileFormat, setFileFormat] = useState('pdf');
  const [downloading, setDownloading] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const range = useMemo(
    () => getDateRange(preset, customFrom, customTo, activeFY),
    [preset, customFrom, customTo, activeFY],
  );

  const isCustomValid = preset !== 'custom' || (customFrom && customTo && customFrom <= customTo);

  const preview = useMemo(() => ({
    income:      { count: previewCount(income, range.from, range.to),      total: previewSum(income, range.from, range.to) },
    expenses:    { count: previewCount(expenses, range.from, range.to),    total: previewSum(expenses, range.from, range.to) },
    investments: { count: previewCount(investments, range.from, range.to), total: previewSum(investments, range.from, range.to) },
  }), [income, expenses, investments, range]);

  const handleDownload = async () => {
    if (!isCustomValid) return;
    setDownloading(true);
    try {
      if (fileFormat === 'pdf') {
        downloadPDF(income, expenses, investments, range, userName, activeFY);
      } else {
        downloadCSV(income, expenses, investments, range, userName);
      }
    } finally {
      setTimeout(() => setDownloading(false), 800);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Download Statement" size="lg">
      <div className="space-y-5">

        {/* Date range presets */}
        <div>
          <p className="label mb-2" id="date-range-label">Date Range</p>
          <div role="group" aria-labelledby="date-range-label" className="grid grid-cols-3 gap-2">
            {PRESET_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setPreset(opt.value)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
                  preset === opt.value
                    ? 'bg-primary-600 border-primary-500 text-white shadow-lg shadow-primary-900/30'
                    : 'border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/30 hover:bg-slate-50 dark:hover:bg-white/5'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom date inputs */}
        {preset === 'custom' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="stmt-from" className="label">From *</label>
              <input
                id="stmt-from"
                type="date" className="input-field" max={customTo || today}
                value={customFrom} onChange={e => setCustomFrom(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="stmt-to" className="label">To *</label>
              <input
                id="stmt-to"
                type="date" className="input-field" min={customFrom} max={today}
                value={customTo} onChange={e => setCustomTo(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Resolved range display */}
        {isCustomValid && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
            <Calendar aria-hidden="true" size={13} className="text-primary-400 flex-shrink-0" />
            <span className="text-xs text-slate-500 dark:text-white/60">
              {format(range.from, 'dd MMM yyyy')} — {format(range.to, 'dd MMM yyyy')}
            </span>
          </div>
        )}

        {/* Preview summary */}
        <div>
          <p className="label mb-2">Preview</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Income',      color: 'text-green-400',  border: 'border-green-500/20',  ...preview.income },
              { label: 'Expenses',    color: 'text-red-400',    border: 'border-red-500/20',    ...preview.expenses },
              { label: 'Investments', color: 'text-yellow-400', border: 'border-yellow-500/20', ...preview.investments },
            ].map(s => (
              <div key={s.label} className={`glass-card p-3 rounded-xl border ${s.border}`}>
                <p className={`text-xs font-semibold ${s.color}`}>{s.label}</p>
                <p className="text-slate-900 dark:text-white font-bold text-sm mt-1">{formatCurrency(s.total)}</p>
                <p className="text-slate-400 dark:text-white/40 text-xs">{s.count} entries</p>
              </div>
            ))}
          </div>
        </div>

        {/* Format selector */}
        <div>
          <p className="label mb-2" id="file-format-label">File Format</p>
          <div role="group" aria-labelledby="file-format-label" className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setFileFormat('pdf')}
              aria-pressed={fileFormat === 'pdf'}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                fileFormat === 'pdf'
                  ? 'bg-primary-600/20 border-primary-500/50 text-slate-900 dark:text-white'
                  : 'border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/40 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/30'
              }`}
            >
              <FileText aria-hidden="true" size={20} className={fileFormat === 'pdf' ? 'text-primary-500 dark:text-primary-400' : ''} />
              <div className="text-left">
                <p className="text-sm font-medium">PDF</p>
                <p className="text-xs text-slate-400 dark:text-white/40">Formatted statement</p>
              </div>
              {fileFormat === 'pdf' && <CheckCircle aria-hidden="true" size={14} className="ml-auto text-primary-500 dark:text-primary-400" />}
            </button>

            <button
              onClick={() => setFileFormat('csv')}
              aria-pressed={fileFormat === 'csv'}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                fileFormat === 'csv'
                  ? 'bg-green-600/20 border-green-500/50 text-slate-900 dark:text-white'
                  : 'border-slate-200 dark:border-white/10 text-slate-400 dark:text-white/40 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/30'
              }`}
            >
              <FileSpreadsheet aria-hidden="true" size={20} className={fileFormat === 'csv' ? 'text-green-400' : ''} />
              <div className="text-left">
                <p className="text-sm font-medium">CSV</p>
                <p className="text-xs text-slate-400 dark:text-white/40">Spreadsheet / Excel</p>
              </div>
              {fileFormat === 'csv' && <CheckCircle aria-hidden="true" size={14} className="ml-auto text-green-400" />}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button
            onClick={handleDownload}
            disabled={!isCustomValid || downloading}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {downloading
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><Download aria-hidden="true" size={15} /> Download {fileFormat.toUpperCase()}</>
            }
          </button>
        </div>

      </div>
    </Modal>
  );
}
