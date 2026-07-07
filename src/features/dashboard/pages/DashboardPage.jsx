import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from '@tanstack/react-router'
import {
  DollarSign,
  ClipboardList,
  Briefcase,
  FileSpreadsheet,
  Package,
  Settings as SettingsIcon
} from 'lucide-react'
import MetricCard from '../../../components/shared/MetricCard'
import { AreaChart, BarChart } from '../../../components/shared/Charts'

export default function DashboardPage() {
  // Grab state from store
  const products = useSelector(state => state.products.items)
  const orders = useSelector(state => state.orders.items)
  const dealers = useSelector(state => state.dealers.items)
  const bulkOrders = useSelector(state => state.bulkOrders.items)

  // Calculations
  const totalRevenue = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.amount, 0)
    
  const activeOrdersCount = orders.filter(o => ['Pending', 'Shipped'].includes(o.status)).length
  const pendingDealersCount = dealers.filter(d => d.status === 'Pending').length
  const pendingBulkCount = bulkOrders.filter(b => b.status === 'Pending').length

  // Quick activities log
  const recentActivities = [
    ...orders.slice(0, 2).map(o => ({
      id: `act-ord-${o.id}`,
      title: `Order ${o.id} placed`,
      desc: `Customer ${o.customerName} ordered snacks for $${o.amount.toFixed(2)}`,
      time: 'Recently',
      badge: 'Order'
    })),
    ...dealers.slice(0, 1).map(d => ({
      id: `act-dlr-${d.id}`,
      title: 'New Distributor Signup',
      desc: `${d.name} (${d.businessName}) registered from ${d.location}`,
      time: '1 hour ago',
      badge: 'Distributor'
    })),
    ...bulkOrders.slice(0, 1).map(b => ({
      id: `act-blk-${b.id}`,
      title: 'Bulk Order Quote Requested',
      desc: `${b.name} requested ${b.quantity} packs for event on ${b.eventDate}`,
      time: '3 hours ago',
      badge: 'B2B Inquiry'
    }))
  ]

  // Chart data
  const revenueData = [4500, 6200, 8900, 7400, 11200, totalRevenue || 12450]
  const revenueLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']

  // Category chart mapping
  const categoryCounts = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + (p.stock || 0)
    return acc
  }, {})

  const catLabels = Object.keys(categoryCounts)
  const catData = Object.values(categoryCounts)

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header section */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-display">Dashboard Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time metrics, leads, and operational statistics for Zaylo Snacks.</p>
      </div>

      {/* Analytics Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={DollarSign}
          trend="+18%"
          trendDirection="up"
          trendLabel="vs last month"
        />
        <MetricCard
          title="Active Orders"
          value={activeOrdersCount.toString()}
          icon={ClipboardList}
          trend={activeOrdersCount > 2 ? '+2' : '0'}
          trendDirection="up"
          trendLabel="needs processing"
        />
        <MetricCard
          title="Pending Dealers"
          value={pendingDealersCount.toString()}
          icon={Briefcase}
          trend={pendingDealersCount > 0 ? `${pendingDealersCount} pending` : '0'}
          trendDirection={pendingDealersCount > 0 ? 'up' : 'down'}
          trendLabel="requires verification"
        />
        <MetricCard
          title="B2B Bulk Quotes"
          value={pendingBulkCount.toString()}
          icon={FileSpreadsheet}
          trend={pendingBulkCount > 0 ? 'Action needed' : 'All clear'}
          trendDirection={pendingBulkCount > 0 ? 'up' : 'down'}
          trendLabel="pending quotes"
        />
      </div>

      {/* Chart analytics section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Area Chart */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-foreground font-display">Revenue Trend (2026)</h3>
              <p className="text-xs text-muted-foreground">Monthly sales statistics in USD</p>
            </div>
            <span className="text-xs font-bold text-primary bg-primary-light px-2.5 py-1 rounded-full">
              Growth positive
            </span>
          </div>
          <div className="flex-1 min-h-[220px] flex items-center justify-center">
            <AreaChart data={revenueData} labels={revenueLabels} height={230} />
          </div>
        </div>

        {/* Category distribution Bar Chart */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-foreground font-display">Stock by Category</h3>
              <p className="text-xs text-muted-foreground">Current warehouse units breakdown</p>
            </div>
          </div>
          <div className="flex-1 min-h-[220px] flex items-center justify-center">
            {catData.length > 0 ? (
              <BarChart data={catData} labels={catLabels} height={230} />
            ) : (
              <p className="text-xs text-muted-foreground">No stock data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent activity & shortcuts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity feed */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
            <h3 className="text-lg font-bold text-foreground font-display">Recent Activity Alerts</h3>
            <span className="text-xs text-muted-foreground">Operations Log</span>
          </div>
          <div className="space-y-4 flex-1">
            {recentActivities.map((act) => (
              <div key={act.id} className="flex items-start gap-4 hover:bg-muted/15 p-2 rounded-xl transition-all">
                <div className="w-2.5 h-2.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <div className="flex-1">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-sm font-bold text-foreground">{act.title}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
                      {act.badge}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{act.desc}</p>
                </div>
                <span className="text-[10px] text-muted-foreground font-semibold shrink-0">
                  {act.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Operations panel */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
            <h3 className="text-lg font-bold text-foreground font-display">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 flex-1">
            <Link
              to="/products"
              className="flex flex-col items-center justify-center p-4 bg-muted/40 hover:bg-primary-light hover:text-primary rounded-xl border border-border text-center transition-all group gap-2"
            >
              <Package size={22} className="text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-xs font-bold">Add Product</span>
            </Link>
            <Link
              to="/orders"
              className="flex flex-col items-center justify-center p-4 bg-muted/40 hover:bg-primary-light hover:text-primary rounded-xl border border-border text-center transition-all group gap-2"
            >
              <ClipboardList size={22} className="text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-xs font-bold">View Orders</span>
            </Link>
            <Link
              to="/dealers"
              className="flex flex-col items-center justify-center p-4 bg-muted/40 hover:bg-primary-light hover:text-primary rounded-xl border border-border text-center transition-all group gap-2"
            >
              <Briefcase size={22} className="text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-xs font-bold">Dealer Signups</span>
            </Link>
            <Link
              to="/settings"
              className="flex flex-col items-center justify-center p-4 bg-muted/40 hover:bg-primary-light hover:text-primary rounded-xl border border-border text-center transition-all group gap-2"
            >
              <SettingsIcon size={22} className="text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-xs font-bold">Edit Settings</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
