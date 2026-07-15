const ChartCard = ({ title, children, action }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#e4dccf] dark:border-slate-700 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{title}</h3>
        {action && <div>{action}</div>}
      </div>
      <div className="w-full">
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
