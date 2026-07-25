import React, { useCallback, useMemo, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import {
  DollarSign,
  ClipboardList,
  Briefcase,
  FileSpreadsheet,
  Package,
  Settings as SettingsIcon,
  XCircle,
  UserCheck,
  Download,
  RefreshCw,
  AlertTriangle,
  Activity,
} from 'lucide-react'
import Button from '../../../components/ui/Button'
import { useGetDashboardQuery } from '../../../store/api/ops.api'
import { cn } from '../../../utils/cn'
import KpiCard from '../components/KpiCard'
import DashboardSkeleton from '../components/DashboardSkeleton'
import {
  RevenueAreaChart,
  StockBarChart,
  OrderStatusPieChart,
} from '../components/DashboardCharts'
import { exportDashboardCsv } from '../utils/exportCsv'

const PRESETS = [
  { key: '7d', label: '7D' },
  { key: '30d', label: '30D' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
]

function toInputDate(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toISOString().slice(0, 10)
  } catch {
    return ''
  }
}

function formatMoney(n) {
  return `₹${Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [range, setRange] = useState('30d')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const queryArgs = useMemo(() => {
    if (range === 'custom') {
      return from && to ? { range: 'custom', from, to } : { range: '30d' }
    }
    return { range }
  }, [range, from, to])

  const { data: envelope, isLoading, isFetching, isError, error, refetch } =
    useGetDashboardQuery(queryArgs, {
      refetchOnFocus: true,
      refetchOnReconnect: true,
      pollingInterval: 120_000,
      selectFromResult: ({ data, ...rest }) => ({
        data,
        ...rest,
      }),
    })

  const d = envelope?.data

  const stockSeries = useMemo(() => {
    if (d?.stockSeries?.length) return d.stockSeries
    return Object.entries(d?.stockByCategory || {}).map(([name, value]) => ({ name, value }))
  }, [d])

  const statusSeries = useMemo(() => {
    if (d?.orderStatusSeries?.length) return d.orderStatusSeries
    const breakdown = d?.orderStatusBreakdown
    if (!breakdown) return []
    if (Array.isArray(breakdown)) return breakdown
    return Object.entries(breakdown).map(([name, value]) => ({ name, value }))
  }, [d])

  const recentActivities = useMemo(() => {
    if (!d) return []
    return [
      ...(d.recentOrders || []).slice(0, 4).map((o) => ({
        id: `act-ord-${o.id}`,
        title: `Order ${o.orderCode || o.id}`,
        desc: `${o.customerName} · ${formatMoney(o.amount)} · ${o.status}`,
        time: o.date || o.createdAt,
        badge: 'Order',
        link: '/orders',
      })),
      ...(d.recentDealers || []).slice(0, 3).map((dealer) => ({
        id: `act-dlr-${dealer.id}`,
        title: dealer.businessName || dealer.name,
        desc: `${dealer.name} · ${dealer.location || dealer.city || '—'} · ${dealer.status}`,
        time: dealer.date || dealer.createdAt,
        badge: 'Dealer',
        link: '/dealers',
      })),
    ]
  }, [d])

  const applyCustom = useCallback(() => {
    if (from && to) setRange('custom')
  }, [from, to])

  const handleExport = useCallback(() => {
    if (d) exportDashboardCsv(d, `zaylo-dashboard-${d.range?.key || 'export'}.csv`)
  }, [d])

  if (isLoading && !d) return <DashboardSkeleton />

  if (isError && !d) {
    return (
      <div className="rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/80 dark:bg-rose-950/20 p-8 text-center space-y-3">
        <AlertTriangle className="mx-auto text-rose-500" size={32} />
        <p className="text-sm font-bold text-rose-600 dark:text-rose-400">
          {error?.data?.message || 'Failed to load dashboard'}
        </p>
        <Button onClick={() => refetch()} className="inline-flex items-center gap-2">
          <RefreshCw size={16} /> Retry
        </Button>
      </div>
    )
  }

  const rangeLabel =
    d?.range?.from && d?.range?.to
      ? `${toInputDate(d.range.from)} → ${toInputDate(d.range.to)}`
      : ''

  return (
    <div className="space-y-6 pb-4">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-display"
          >
            Dashboard
          </motion.h1>
          <p className="text-sm text-muted-foreground mt-1 flex flex-wrap items-center gap-2">
            <span>Live ops overview{rangeLabel ? ` · ${rangeLabel}` : ''}</span>
            {isFetching && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary">
                <RefreshCw size={12} className="animate-spin" /> Updating
              </span>
            )}
          </p>
        </div>

        {/* All filters on one line */}
        <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
          <div className="flex flex-nowrap items-center gap-1 p-1 rounded-xl bg-muted/60 border border-border/60 backdrop-blur shrink-0">
            {PRESETS.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setRange(p.key)}
                className={cn(
                  'px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap',
                  range === p.key
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-muted-foreground hover:bg-card hover:text-foreground',
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          <input
            type="date"
            aria-label="From"
            title="From"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="h-9 shrink-0 rounded-xl border border-border bg-card px-2.5 text-xs font-semibold text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
          />
          <span className="text-xs font-bold text-muted-foreground shrink-0">to</span>
          <input
            type="date"
            aria-label="To"
            title="To"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="h-9 shrink-0 rounded-xl border border-border bg-card px-2.5 text-xs font-semibold text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
          />

          <Button
            type="button"
            variant="secondary"
            onClick={applyCustom}
            disabled={!from || !to}
            className="h-9 shrink-0 px-3 py-0 text-xs whitespace-nowrap"
          >
            Apply
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleExport}
            disabled={!d}
            className="h-9 shrink-0 gap-1.5 px-3 py-0 text-xs whitespace-nowrap"
          >
            <Download size={14} /> Export
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => refetch()}
            className="h-9 w-9 shrink-0 p-0"
            title="Refresh"
          >
            <RefreshCw size={15} className={isFetching ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        <KpiCard
          index={0}
          title="Total Revenue"
          value={formatMoney(d?.totalRevenue)}
          icon={DollarSign}
          accent="emerald"
          trend={d?.avgOrderValue != null ? `AOV ${formatMoney(d.avgOrderValue)}` : undefined}
          trendDirection="up"
          trendLabel="in range"
          onClick={() => navigate({ to: '/orders' })}
        />
        <KpiCard
          index={1}
          title="Active Orders"
          value={String(d?.activeOrders ?? 0)}
          icon={ClipboardList}
          accent="sky"
          trend={String(d?.orderCount ?? 0)}
          trendDirection="up"
          trendLabel="total orders"
          onClick={() => navigate({ to: '/orders' })}
        />
        <KpiCard
          index={2}
          title="Cancelled Orders"
          value={String(d?.cancelledOrders ?? 0)}
          icon={XCircle}
          accent="rose"
          trend={(d?.cancelledOrders ?? 0) > 0 ? 'Review' : 'Clear'}
          trendDirection={(d?.cancelledOrders ?? 0) > 0 ? 'down' : 'up'}
          trendLabel="in range"
          onClick={() => navigate({ to: '/orders' })}
        />
        <KpiCard
          index={3}
          title="Pending Dealers"
          value={String(d?.pendingDealers ?? 0)}
          icon={Briefcase}
          accent="amber"
          trend={(d?.pendingDealers ?? 0) > 0 ? 'Action' : '0'}
          trendDirection={(d?.pendingDealers ?? 0) > 0 ? 'up' : 'down'}
          trendLabel="awaiting review"
          onClick={() => navigate({ to: '/dealers' })}
        />
        <KpiCard
          index={4}
          title="Approved Dealers"
          value={String(d?.approvedDealers ?? 0)}
          icon={UserCheck}
          accent="primary"
          trend="Approved"
          trendDirection="up"
          trendLabel="in range"
          onClick={() => navigate({ to: '/dealers' })}
        />
        <KpiCard
          index={5}
          title="B2B Bulk Quotes"
          value={String(d?.pendingBulk ?? 0)}
          icon={FileSpreadsheet}
          accent="violet"
          trend={(d?.pendingBulk ?? 0) > 0 ? 'Pending' : 'Clear'}
          trendDirection={(d?.pendingBulk ?? 0) > 0 ? 'up' : 'down'}
          trendLabel="quotes"
          onClick={() => navigate({ to: '/bulk-orders' })}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <RevenueAreaChart series={d?.revenueSeries || []} />
        <StockBarChart series={stockSeries} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <OrderStatusPieChart series={statusSeries} />

        {/* Activity */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 rounded-2xl border border-border/80 bg-card/70 dark:bg-card/50 backdrop-blur-xl shadow-[var(--shadow-card)] p-4 sm:p-5"
        >
          <div className="flex items-center justify-between mb-4 border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-primary" />
              <h3 className="text-base sm:text-lg font-bold font-display">Recent Activity</h3>
            </div>
            <Link to="/notifications" className="text-xs font-bold text-primary hover:underline">
              Notifications
            </Link>
          </div>
          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
            {recentActivities.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                No recent activity in this range.
              </div>
            ) : (
              recentActivities.map((act, i) => (
                <motion.div
                  key={act.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link
                    to={act.link}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/40 transition-colors block"
                  >
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-2">
                        <h4 className="text-sm font-bold text-foreground truncate">{act.title}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-muted rounded-full text-muted-foreground shrink-0">
                          {act.badge}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{act.desc}</p>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { to: '/products', icon: Package, label: 'Products' },
          { to: '/orders', icon: ClipboardList, label: 'Orders' },
          { to: '/dealers', icon: Briefcase, label: 'Dealers' },
          { to: '/settings', icon: SettingsIcon, label: 'Settings' },
        ].map((item, i) => {
          const Icon = item.icon
          return (
            <motion.div key={item.to} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
              <Link
                to={item.to}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-border/80 bg-card/60 backdrop-blur hover:border-primary/40 hover:bg-primary-light/40 transition-all text-center group"
              >
                <Icon size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-xs font-bold">{item.label}</span>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
