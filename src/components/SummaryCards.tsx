import { SummaryStats } from '@/types';
import { formatCurrency } from '@/utils';
import CategoryBadge from './CategoryBadge';

interface Props {
  stats: SummaryStats;
}

interface CardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: string;
  colorClass: string;
  bgClass: string;
}

function StatCard({ title, value, subtitle, icon, colorClass, bgClass }: CardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start gap-4">
      <div className={`${bgClass} rounded-xl p-3 text-2xl flex-shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <p className={`text-2xl font-bold ${colorClass} truncate`}>{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}

export default function SummaryCards({ stats }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard
        title="Total Spending"
        value={formatCurrency(stats.totalAll)}
        subtitle={`${stats.expenseCount} expense${stats.expenseCount !== 1 ? 's' : ''}`}
        icon="💰"
        colorClass="text-gray-800"
        bgClass="bg-gray-100"
      />
      <StatCard
        title="This Month"
        value={formatCurrency(stats.totalThisMonth)}
        subtitle="Current month"
        icon="📅"
        colorClass="text-blue-700"
        bgClass="bg-blue-50"
      />
      <StatCard
        title="This Week"
        value={formatCurrency(stats.totalThisWeek)}
        subtitle="Mon – today"
        icon="📆"
        colorClass="text-indigo-700"
        bgClass="bg-indigo-50"
      />
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start gap-4">
        <div className="bg-emerald-50 rounded-xl p-3 text-2xl flex-shrink-0">🏆</div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-500 mb-1">Top Category</p>
          {stats.topCategory ? (
            <>
              <div className="mt-1">
                <CategoryBadge category={stats.topCategory} size="md" />
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                {formatCurrency(stats.topCategoryAmount)}
              </p>
            </>
          ) : (
            <p className="text-2xl font-bold text-gray-400">—</p>
          )}
        </div>
      </div>
    </div>
  );
}
