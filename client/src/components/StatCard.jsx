const StatCard = ({ icon: Icon, label, value, trend, trendUp, color = 'brand' }) => {
  const colorMap = {
    brand: { bg: 'bg-brand-50 dark:bg-brand-900/30', icon: 'text-brand-600' },
    green: { bg: 'bg-emerald-50 dark:bg-emerald-900/30', icon: 'text-emerald-600' },
    red: { bg: 'bg-red-50 dark:bg-red-900/30', icon: 'text-red-600' },
    yellow: { bg: 'bg-amber-50 dark:bg-amber-900/30', icon: 'text-amber-600' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-900/30', icon: 'text-purple-600' },
    slate: { bg: 'bg-slate-100 dark:bg-slate-800', icon: 'text-slate-600 dark:text-slate-400' },
  };
  const c = colorMap[color] || colorMap.brand;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#e4dccf] dark:border-slate-700 p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{value}</p>
          {trend && (
            <p className={`text-xs font-medium flex items-center gap-1 ${trendUp ? 'text-emerald-600' : 'text-red-500'}`}>
              {trendUp ? '↑' : '↓'} {trend}
            </p>
          )}
        </div>
        <div className={`p-2.5 rounded-lg ${c.bg}`}>
          {Icon && <Icon className={`w-5 h-5 ${c.icon}`} />}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
