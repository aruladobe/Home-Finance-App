import { TrendingUp, TrendingDown } from 'lucide-react';

const CARD_GRADIENT = {
  income:     'from-emerald-500/20 to-emerald-600/10 border-emerald-500/20',
  expense:    'from-red-500/20 to-red-600/10 border-red-500/20',
  investment: 'from-blue-500/20 to-blue-600/10 border-blue-500/20',
  profit:     'from-yellow-500/20 to-yellow-600/10 border-yellow-500/20',
  primary:    'from-primary-500/20 to-purple-600/10 border-primary-500/20',
};

const ICON_COLOR = {
  income:     'text-emerald-500 dark:text-emerald-400',
  expense:    'text-red-500 dark:text-red-400',
  investment: 'text-blue-500 dark:text-blue-400',
  profit:     'text-yellow-500 dark:text-yellow-400',
  primary:    'text-primary-500 dark:text-primary-400',
};

const ICON_BG = {
  income:     'bg-emerald-500/15 dark:bg-emerald-500/20',
  expense:    'bg-red-500/15 dark:bg-red-500/20',
  investment: 'bg-blue-500/15 dark:bg-blue-500/20',
  profit:     'bg-yellow-500/15 dark:bg-yellow-500/20',
  primary:    'bg-primary-500/15 dark:bg-primary-500/20',
};

export default function StatCard({ title, value, icon: Icon, color, trend, trendValue, subtitle }) {
  const gradient = CARD_GRADIENT[color] || CARD_GRADIENT.primary;
  const iconColor = ICON_COLOR[color] || ICON_COLOR.primary;
  const iconBg = ICON_BG[color] || ICON_BG.primary;

  return (
    <div className={`glass-card p-5 bg-gradient-to-br ${gradient} hover:scale-[1.02] transition-all duration-300`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center`}>
          <Icon size={20} className={iconColor} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trend >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {Math.abs(trendValue || trend)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500 dark:text-white/50 mb-1">{title}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        {subtitle && <p className="text-xs text-slate-400 dark:text-white/40 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
