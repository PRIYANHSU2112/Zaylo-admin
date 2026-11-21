import React, { useState } from 'react'
import { Eye, Trash2, FileText } from 'lucide-react'
import {
  useGetOrdersQuery,
  useSetOrderStatusMutation,
  useSetOrderPaymentMutation,
  useDeleteOrderMutation,
  useBulkOrdersMutation,
} from '../../../store/api/ops.api'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import Select from '../../../components/ui/Select'
import Modal from '../../../components/ui/Modal'
import AdminTable from '../../../components/shared/AdminTable'
import PageSkeleton from '../../../components/shared/PageSkeleton'
import { API_BASE_URL } from '../../../config/env'
import { getStoredToken } from '../../../lib/tokenStorage'

/** Mirrors backend STATUS_TRANSITIONS — the server is the authority and rejects anything else. */
const NEXT = {
  Pending: ['Confirmed', 'Cancelled'],
  Confirmed: ['Packed', 'Shipped', 'Cancelled'],
  Packed: ['Shipped', 'Cancelled'],
  Shipped: ['Delivered'],
  Delivered: [],
  Cancelled: [],
}
const STATUSES = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled']
const PAGE_SIZE = 20
const money = (n) => `₹${Number(n || 0).toFixed(2)}`
const errMsg = (e) => e?.data?.message || e?.message || 'Request failed'

async function openInvoice(id) {
  const win = window.open('', '_blank')
  try {
    const res = await fetch(`${API_BASE_URL.replace(/\/+$/, '')}/admin/orders/${id}/invoice`, {
      headers: { Authorization: `Bearer ${getStoredToken()}` },
    })
    if (!res.ok) throw new Error((await res.json().catch(() => null))?.message || 'Invoice unavailable')
    const url = URL.createObjectURL(new Blob([await res.text()], { type: 'text/html' }))
    win.location.href = url
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  } catch (e) {
    win?.close()
    alert(e.message)
  }
}

export default function OrdersPage() {
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all')

  const { data: res, isLoading, isFetching, isError, error } = useGetOrdersQuery({
    page,
    limit: PAGE_SIZE,
    q,
    status: statusFilter,
    paymentMethod: paymentFilter,
    paymentStatus: paymentStatusFilter,
  })
  const [setOrderStatus, { isLoading: saving }] = useSetOrderStatusMutation()
  const [setOrderPayment, { isLoading: savingPay }] = useSetOrderPaymentMutation()
  const [deleteOrder] = useDeleteOrderMutation()
  const [bulkOrders] = useBulkOrdersMutation()
  const orders = res?.data || []
  const meta = res?.meta

  const [selected, setSelected] = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [form, setForm] = useState({ status: '', courier: '', trackingNumber: '', note: '' })
  const [formError, setFormError] = useState('')

  const filter = (setter) => (e) => {
    setter(e.target.value)
    setPage(1)
  }

  const openStatus = (row) => {
    setSelected(row)
    setForm({ status: NEXT[row.status]?.[0] || row.status, courier: row.courier || '', trackingNumber: row.trackingNumber || '', note: '' })
    setFormError('')
    setStatusOpen(true)
  }

  const markCodCollected = async (row) => {
    if (!confirm(`Confirm cash of ${money(row.amount)} was collected for ${row.orderCode}?`)) return
    try {
      const updated = await setOrderPayment({ id: row.id, action: 'cod-collected' }).unwrap()
      if (selected?.id === row.id) setSelected(updated?.data || updated)
    } catch (e) {
      alert(errMsg(e))
    }
  }

  const headers = [
    {
      key: 'orderCode',
      label: 'Order ID',
      render: (val, row) => <span className="font-bold font-mono text-primary">{val || row.id}</span>,
    },
    {
      key: 'createdAt',
      label: 'Date & Time',
      render: (val, row) => new Date(val || row.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
    },
    {
      key: 'customerName',
      label: 'Customer',
      render: (_v, row) => (
        <div>
          <p className="font-semibold text-foreground">{row.customerName}</p>
          <p className="text-xs text-muted-foreground">{row.customerEmail} • {row.customerPhone}</p>
        </div>
      ),
    },
    {
      key: 'amount',
      label: 'Total',
      render: (val) => <span className="font-bold text-foreground">{money(val)}</span>,
    },
    {
      key: 'paymentStatus',
      label: 'Payment',
      render: (val, row) => (
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-muted border border-border w-fit">{row.paymentMethod}</span>
          <span className={`text-xs font-bold ${val === 'Paid' ? 'text-emerald-600' : val === 'Failed' ? 'text-rose-600' : 'text-amber-600'}`}>{val || 'Pending'}</span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Fulfilment',
      render: (val, row) =>
        NEXT[val]?.length ? (
          <button onClick={() => openStatus(row)} className="cursor-pointer block" title="Update status">
            <Badge variant={val}>{val}</Badge>
          </button>
        ) : (
          <Badge variant={val}>{val}</Badge>
        ),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (_v, row) => (
        <div className="flex justify-end gap-1.5">
          <button
            onClick={() => {
              setSelected(row)
              setDetailsOpen(true)
            }}
            className="p-1.5 text-muted-foreground hover:text-primary rounded-lg cursor-pointer"
            aria-label="View order"
          >
            <Eye size={16} />
          </button>
          {row.invoiceAvailable && (
            <button onClick={() => openInvoice(row.id)} className="p-1.5 text-muted-foreground hover:text-primary rounded-lg cursor-pointer" aria-label="Invoice">
              <FileText size={16} />
            </button>
          )}
          <button
            onClick={() => {
              if (confirm('Delete this order? Reserved stock for unshipped orders is returned.')) deleteOrder(row.id)
            }}
            className="p-1.5 text-muted-foreground hover:text-red-500 rounded-lg cursor-pointer"
            aria-label="Delete order"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ]

  const bulkActions = [
    {
      label: 'Mark Confirmed',
      action: async (ids) => {
        const r = await bulkOrders({ action: 'status', ids, status: 'Confirmed' }).unwrap().catch((e) => alert(errMsg(e)))
        if (r?.data?.failed?.length) alert(`${r.data.failed.length} order(s) could not be updated (invalid transition).`)
      },
      variant: 'outline',
    },
    {
      label: 'Delete Selected',
      action: (ids) => {
        if (confirm(`Delete ${ids.length} orders?`)) bulkOrders({ action: 'delete', ids })
      },
      variant: 'danger',
    },
  ]

  if (isLoading) return <PageSkeleton />
  if (isError) return <div className="text-sm font-bold text-rose-600">{errMsg(error)}</div>

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <div className="border-b border-border pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-display">Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">Fulfilment and payment are tracked separately. COD is marked paid only after cash is collected.</p>
      </div>

      <AdminTable
        headers={headers}
        data={orders}
        loading={isFetching}
        searchPlaceholder="Search order ID, customer, email, address..."
        idField="id"
        bulkActions={bulkActions}
        server={{ page, limit: PAGE_SIZE, total: meta?.total || 0, onPageChange: setPage, onSearch: (v) => { setQ(v); setPage(1) } }}
        filters={
          <div className="flex flex-wrap gap-2">
            <Select value={statusFilter} onChange={filter(setStatusFilter)} className="py-2.5 px-3 text-xs h-10">
              <option value="all">All Statuses</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
            <Select value={paymentFilter} onChange={filter(setPaymentFilter)} className="py-2.5 px-3 text-xs h-10">
              <option value="all">All Methods</option>
              <option value="COD">COD</option>
              <option value="Razorpay">Razorpay</option>
            </Select>
            <Select value={paymentStatusFilter} onChange={filter(setPaymentStatusFilter)} className="py-2.5 px-3 text-xs h-10">
              <option value="all">All Payment States</option>
              <option value="Pending">Payment Pending</option>
              <option value="Paid">Paid</option>
              <option value="Failed">Failed</option>
              <option value="Refunded">Refunded</option>
            </Select>
          </div>
        }
      />

      <Modal open={statusOpen} onClose={() => setStatusOpen(false)} title={`Update ${selected?.orderCode || 'order'}`}>
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            setFormError('')
            if (form.status === 'Cancelled' && !confirm('Cancel this order? Stock will be returned to inventory.')) return
            try {
              await setOrderStatus({ id: selected.id, ...form }).unwrap()
              setStatusOpen(false)
            } catch (err) {
              setFormError(errMsg(err))
            }
          }}
          className="space-y-4"
        >
          <p className="text-xs text-muted-foreground">Current status: <strong>{selected?.status}</strong></p>
          <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} label="Move to">
            {(NEXT[selected?.status] || []).map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
          {form.status === 'Shipped' && (
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs font-semibold">Courier
                <input className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm" value={form.courier} onChange={(e) => setForm({ ...form, courier: e.target.value })} />
              </label>
              <label className="text-xs font-semibold">Tracking number
                <input className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm" value={form.trackingNumber} onChange={(e) => setForm({ ...form, trackingNumber: e.target.value })} />
              </label>
            </div>
          )}
          <label className="block text-xs font-semibold">Note (optional)
            <input className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm" value={form.note} maxLength={300} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </label>
          {formError && <p className="text-sm font-semibold text-rose-600">{formError}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setStatusOpen(false)}>Close</Button>
            <Button type="submit" disabled={saving || !form.status}>{saving ? 'Saving…' : 'Save'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={detailsOpen} onClose={() => setDetailsOpen(false)} title={selected?.orderCode || 'Order'}>
        {selected && (
          <div className="space-y-3 text-sm">
            <div className="flex flex-wrap gap-2">
              <Badge variant={selected.status}>{selected.status}</Badge>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-muted border border-border">{selected.paymentMethod} · {selected.paymentStatus}</span>
            </div>
            <p><span className="text-muted-foreground">Customer:</span> <strong>{selected.customerName}</strong> · {selected.customerEmail} · {selected.customerPhone}</p>
            <p><span className="text-muted-foreground">Address:</span> {selected.shippingAddress}</p>
            {(selected.courier || selected.trackingNumber) && (
              <p><span className="text-muted-foreground">Shipment:</span> {selected.courier} {selected.trackingNumber}</p>
            )}
            <div className="border-t border-border pt-3">
              <p className="text-xs font-bold text-muted-foreground mb-2">Items</p>
              {(selected.items || []).map((item, i) => (
                <p key={i} className="text-xs flex justify-between"><span>{item.name} × {item.quantity}</span><span>{money(item.lineTotal || item.price * item.quantity)}</span></p>
              ))}
            </div>
            <div className="border-t border-border pt-3 text-xs space-y-1">
              {selected.subtotal > 0 && <p className="flex justify-between"><span>Subtotal</span><span>{money(selected.subtotal)}</span></p>}
              {selected.discount > 0 && <p className="flex justify-between"><span>Discount {selected.couponCode}</span><span>−{money(selected.discount)}</span></p>}
              <p className="flex justify-between"><span>Shipping</span><span>{money(selected.shippingFee)}</span></p>
              {selected.codFee > 0 && <p className="flex justify-between"><span>COD fee</span><span>{money(selected.codFee)}</span></p>}
              {selected.tax > 0 && <p className="flex justify-between"><span>Tax</span><span>{money(selected.tax)}</span></p>}
              <p className="flex justify-between font-bold text-sm"><span>Total</span><span>{money(selected.amount)}</span></p>
            </div>
            {selected.history?.length > 0 && (
              <div className="border-t border-border pt-3">
                <p className="text-xs font-bold text-muted-foreground mb-2">History</p>
                {[...selected.history].reverse().map((h, i) => (
                  <p key={i} className="text-xs"><strong>{h.kind === 'payment' ? `Payment ${h.value}` : h.value}</strong> {h.note && `— ${h.note}`} <span className="text-muted-foreground">({new Date(h.at).toLocaleString()})</span></p>
                ))}
              </div>
            )}
            <div className="flex flex-wrap justify-end gap-2 pt-2">
              {selected.paymentMethod === 'COD' && selected.paymentStatus !== 'Paid' && ['Shipped', 'Delivered'].includes(selected.status) && (
                <Button variant="outline" disabled={savingPay} onClick={() => markCodCollected(selected)}>Mark COD collected</Button>
              )}
              {selected.invoiceAvailable && <Button variant="secondary" onClick={() => openInvoice(selected.id)}>Invoice</Button>}
              {NEXT[selected.status]?.length > 0 && <Button variant="secondary" onClick={() => { setDetailsOpen(false); openStatus(selected) }}>Update status</Button>}
              <Button onClick={() => setDetailsOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
