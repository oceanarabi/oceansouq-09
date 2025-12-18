import React from 'react';

const colorClasses = {
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', icon: 'text-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
  blue: { bg: 'bg-blue-50 dark:bg-blue-500/10', icon: 'text-blue-500', text: 'text-blue-600 dark:text-blue-400' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-500/10', icon: 'text-purple-500', text: 'text-purple-600 dark:text-purple-400' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-500/10', icon: 'text-orange-500', text: 'text-orange-600 dark:text-orange-400' },
  yellow: { bg: 'bg-yellow-50 dark:bg-yellow-500/10', icon: 'text-yellow-500', text: 'text-yellow-600 dark:text-yellow-400' },
  cyan: { bg: 'bg-cyan-50 dark:bg-cyan-500/10', icon: 'text-cyan-500', text: 'text-cyan-600 dark:text-cyan-400' },
  pink: { bg: 'bg-pink-50 dark:bg-pink-500/10', icon: 'text-pink-500', text: 'text-pink-600 dark:text-pink-400' },
  red: { bg: 'bg-red-50 dark:bg-red-500/10', icon: 'text-red-500', text: 'text-red-600 dark:text-red-400' },
};

const StatsCard = ({ title, value, icon: Icon, color = 'emerald', subtitle }) => {
  const colors = colorClasses[color] || colorClasses.emerald;
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className={`text-2xl font-bold mt-1 ${colors.text}`}>{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${colors.bg}`}>
          <div className={colors.icon}><Icon /></div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
