import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ title, value, icon: Icon, color, trend, trendValue, subtitle }) {
  const colorMap = {
    income: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/20 text-emerald-400',
    expense: 'from-red-500/20 to-red-600/10 border-red-500/20 text-red-400',
    investment: 'from-blue-500/20 to-blue-600/10 border-blue-500/20 text-blue-400',
    profit: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/20 text-yellow-400',
    primary: 'from-primary-500/20 to-purple-600/10 border-primary-500/20 text-primary-400',
  };

  const iconBg = {
    income: 'bg-emerald-500/20',
    expense: 'bg-red-500/20',
    investment: 'bg-blue-500/20',
    profit: 'bg-yellow-500/20',
    primary: 'bg-primary-500/20',
  };

  return (
    <div className={`glass-card p-5 bg-gradient-to-br ${colorMap[color] || colorMap.primary} hover:scale-[1.02] transition-all duration-300`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 ${iconBg[color] || iconBg.primary} rounded-xl flex items-center justify-center`}>
          <Icon size={20} className={colorMap[color]?.split(' ').find(c => c.startsWith('text-')) || 'text-primary-400'} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {Math.abs(trendValue || trend)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-xs font-medium text-white/50 mb-1">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
        {subtitle && <p className="text-xs text-white/40 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
