'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { CategoryTotal, MonthlyTotal, CATEGORY_COLORS } from '@/types';
import { formatCurrency } from '@/utils';

// ─── Monthly Bar Chart ────────────────────────────────────────────────────────

interface MonthlyChartProps {
  data: MonthlyTotal[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function MonthlyTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 shadow-lg rounded-lg px-3 py-2 text-sm">
        <p className="font-medium text-gray-700 mb-1">{label}</p>
        <p className="text-blue-600">{formatCurrency(payload[0].value ?? 0)}</p>
      </div>
    );
  }
  return null;
}

export function MonthlyBarChart({ data }: MonthlyChartProps) {
  if (data.length === 0) {
    return <EmptyChart message="No monthly data yet" />;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12, fill: '#9ca3af' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: '#9ca3af' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `$${v}`}
          width={60}
        />
        <Tooltip content={<MonthlyTooltip />} cursor={{ fill: '#f3f4f6' }} />
        <Bar dataKey="total" fill="#3b82f6" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Category Pie Chart ───────────────────────────────────────────────────────

interface PieChartProps {
  data: CategoryTotal[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PieTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const { name, value } = payload[0];
    const p = payload[0].payload as CategoryTotal;
    return (
      <div className="bg-white border border-gray-200 shadow-lg rounded-lg px-3 py-2 text-sm">
        <p className="font-medium text-gray-700">{name}</p>
        <p style={{ color: CATEGORY_COLORS[p.category] }}>{formatCurrency(value ?? 0)}</p>
        <p className="text-gray-400">{p.percentage.toFixed(1)}%</p>
      </div>
    );
  }
  return null;
}

export function CategoryPieChart({ data }: PieChartProps) {
  if (data.length === 0) {
    return <EmptyChart message="No category data yet" />;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          dataKey="total"
          nameKey="category"
        >
          {data.map((entry) => (
            <Cell
              key={entry.category}
              fill={CATEGORY_COLORS[entry.category]}
            />
          ))}
        </Pie>
        <Tooltip content={<PieTooltip />} />
        <Legend
          formatter={(value) => (
            <span className="text-xs text-gray-600">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ─── Category Breakdown Table ─────────────────────────────────────────────────

interface BreakdownProps {
  data: CategoryTotal[];
}

export function CategoryBreakdown({ data }: BreakdownProps) {
  const totalAll = data.reduce((s, d) => s + d.total, 0);

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">No expenses yet</div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.category}>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-gray-700">
              {item.category}
              <span className="ml-2 text-gray-400 font-normal text-xs">
                ({item.count} item{item.count !== 1 ? 's' : ''})
              </span>
            </span>
            <span className="text-gray-800 font-semibold tabular-nums">
              {formatCurrency(item.total)}
            </span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${totalAll > 0 ? (item.total / totalAll) * 100 : 0}%`,
                backgroundColor: CATEGORY_COLORS[item.category],
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-[220px] text-sm text-gray-400">
      {message}
    </div>
  );
}
