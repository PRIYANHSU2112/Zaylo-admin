import React, { memo, useMemo } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { motion } from 'framer-motion'
import { cn } from '../../../utils/cn'

const PIE_COLORS = ['#f59e0b', '#3b82f6', '#1F9355', '#f43f5e']

function ChartShell({ title, subtitle, children, className, empty, emptyText = 'No data for this range' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'rounded-2xl border border-border/80 bg-card/70 dark:bg-card/50 backdrop-blur-xl',
        'shadow-[var(--shadow-card)] p-4 sm:p-5 flex flex-col min-h-[300px]',
        className,
      )}
    >
      <div className="mb-3">
        <h3 className="text-base sm:text-lg font-bold font-display text-foreground">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex-1 min-h-[220px] w-full">
        {empty ? (
          <div className="h-full min-h-[220px] flex items-center justify-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
            {emptyText}
          </div>
        ) : (
          children
        )}
      </div>
    </motion.div>
  )
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const title = label || payload[0]?.name || payload[0]?.payload?.name || ''
  return (
    <div className="rounded-xl border border-border bg-card/95 backdrop-blur px-3 py-2 shadow-lg text-xs">
      {title ? <p className="font-bold text-foreground mb-1">{title}</p> : null}
      {payload.map((p) => (
        <p key={String(p.dataKey) + String(p.name)} className="text-muted-foreground">
          <span className="font-semibold text-foreground">{p.name || p.dataKey}: </span>
          {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  )
}

export const RevenueAreaChart = memo(function RevenueAreaChart({ series = [] }) {
  const data = useMemo(
    () => series.map((p) => ({ label: p.label, revenue: Number(p.value) || 0 })),
    [series],
  )
  const empty = data.length === 0 || data.every((d) => d.revenue === 0)

  return (
    <ChartShell
      title="Revenue Trend"
      subtitle="Sales in selected period (excl. cancelled)"
      className="lg:col-span-2"
      empty={empty}
    >
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1F9355" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#1F9355" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
          <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" width={48} />
          <Tooltip content={<ChartTooltip />} />
          <Area
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke="#1F9355"
            strokeWidth={2.5}
            fill="url(#revFill)"
            animationDuration={900}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartShell>
  )
})

export const StockBarChart = memo(function StockBarChart({ series = [] }) {
  const data = useMemo(
    () =>
      series.length
        ? series
        : [],
    [series],
  )
  return (
    <ChartShell
      title="Stock by Category"
      subtitle="Warehouse units (all-time)"
      empty={data.length === 0}
      emptyText="No stock data available"
    >
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
          <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" width={40} />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="value" name="Units" fill="#1F9355" radius={[8, 8, 0, 0]} animationDuration={800} />
        </BarChart>
      </ResponsiveContainer>
    </ChartShell>
  )
})

export const OrderStatusPieChart = memo(function OrderStatusPieChart({ series = [] }) {
  const data = useMemo(
    () => (series || []).filter((s) => s.value > 0),
    [series],
  )
  return (
    <ChartShell
      title="Order Status Mix"
      subtitle="Distribution in selected period"
      empty={data.length === 0}
      emptyText="No orders in this range"
    >
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            animationDuration={900}
          >
            {data.map((entry, i) => (
              <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartShell>
  )
})
