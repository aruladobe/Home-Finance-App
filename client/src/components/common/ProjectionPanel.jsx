import { calculateProjection, formatCurrency } from '../../utils/calculations';
import { CalendarClock } from 'lucide-react';

const STATUS_STYLES = {
  upcoming:  { label: 'Upcoming',  color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20' },
  active:    { label: 'Active',    color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  completed: { label: 'Completed', color: 'text-slate-400',    bg: 'bg-slate-500/10 border-slate-500/20' },
  ongoing:   { label: 'Ongoing',   color: 'text-purple-400',  bg: 'bg-purple-500/10 border-purple-500/20' },
};

const PERIOD_LABELS = { daily: 'days', monthly: 'months', yearly: 'years' };

export default function ProjectionPanel({ amount, period, effectiveFrom, effectiveTo, accentColor = 'text-primary-400' }) {
  const proj = calculateProjection(amount, period, effectiveFrom, effectiveTo);
  if (!proj) return null;

  const st = STATUS_STYLES[proj.status];
  const unit = PERIOD_LABELS[period] || 'periods';

  return (
    <div className={`rounded-xl border p-4 space-y-3 ${st.bg}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-white/70">
          <CalendarClock aria-hidden="true" size={14} />
          Projection
        </div>
        <span className={`badge text-xs font-medium ${st.color} bg-slate-100 dark:bg-white/5`}>{st.label}</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {proj.totalExpected !== null && (
          <div className="text-center">
            <p className="text-xs text-slate-400 dark:text-white/40 mb-0.5">Total Expected</p>
            <p className={`text-base font-bold ${accentColor}`}>{formatCurrency(proj.totalExpected)}</p>
            <p className="text-xs text-slate-400 dark:text-white/30">{proj.totalPeriods} {unit}</p>
          </div>
        )}
        <div className="text-center">
          <p className="text-xs text-slate-400 dark:text-white/40 mb-0.5">Elapsed</p>
          <p className="text-base font-bold text-slate-600 dark:text-white/70">{formatCurrency(proj.elapsedAmount)}</p>
          <p className="text-xs text-slate-400 dark:text-white/30">{proj.elapsedPeriods} {unit}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-400 dark:text-white/40 mb-0.5">Remaining</p>
          {proj.remainingAmount !== null ? (
            <>
              <p className={`text-base font-bold ${proj.remainingAmount > 0 ? 'text-yellow-400' : 'text-slate-400 dark:text-white/30'}`}>
                {formatCurrency(proj.remainingAmount)}
              </p>
              <p className="text-xs text-slate-400 dark:text-white/30">{proj.remainingPeriods} {unit}</p>
            </>
          ) : (
            <p className="text-sm text-slate-400 dark:text-white/30">Ongoing</p>
          )}
        </div>
      </div>

      {proj.status === 'active' && proj.totalExpected && (
        <div>
          <div className="flex justify-between text-xs text-slate-400 dark:text-white/40 mb-1">
            <span>Progress</span>
            <span>{Math.round((proj.elapsedAmount / proj.totalExpected) * 100)}%</span>
          </div>
          <div className="bg-slate-200 dark:bg-white/10 rounded-full h-1.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary-500 to-purple-500 transition-all duration-500"
              style={{ width: `${Math.min(100, (proj.elapsedAmount / proj.totalExpected) * 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
