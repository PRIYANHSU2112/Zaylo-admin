import React, { useMemo, useState } from 'react'
import { Eye, Trash2 } from 'lucide-react'
import {
  useGetOrdersQuery,
  useSetOrderStatusMutation,
  useDeleteOrderMutation,
  useBulkOrdersMutation,
} from '../../../store/api/ops.api'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import Select from '../../../components/ui/Select'
import Modal from '../../../components/ui/Modal'
import AdminTable from '../../../components/shared/AdminTable'
import PageSkeleton from '../../../components/shared/PageSkeleton'

export default function OrdersPage() {
  const { data: env, isLoading, isError, error } = useGetOrdersQuery({ limit: 100 })
  const [setOrderStatus, { isLoading: saving }] = useSetOrderStatusMutation()
  const [deleteOrder] = useDeleteOrderMutation()
  const [bulkOrders] = useBulkOrdersMutation()
  const orders = env?.data || []

  const [selectedOrder, setSelectedOrder] = useState(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')

  const filteredOrders = useMemo(
    () =>
      orders.filter((o) => {
        const matchesStatus = statusFilter === 'all' || o.status === statusFilter
        const matchesPayment = paymentFilter === 'all' || o.paymentMethod === paymentFilter
        return matchesStatus && matchesPayment
      }),
    [orders, statusFilter, paymentFilter],
  )

  const headers = [
    {
      key: 'orderCode',
      label: 'Order ID',
      sortable: true,
      render: (val, row) => <span className="font-bold font-mono text-primary">{val || row.id}</span>,
    },
    {
      key: 'date',
      label: 'Date & Time',
      sortable: true,
      render: (val, row) =>
        new Date(val || row.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
    },
    {
      key: 'customerName',
      label: 'Customer Details',
      sortable: true,
      render: (_v, row) => (
        <div>
          <p className="font-semibold text-foreground">{row.customerName}</p>
          <p className="text-xs text-muted-foreground">
            {row.customerEmail} • {row.customerPhone}
          </p>
        </div>
      ),
    },
    {
      key: 'amount',
      label: 'Total Amount',
      sortable: true,
      render: (val) => <span className="font-bold text-foreground">₹{parseFloat(val || 0).toFixed(2)}</span>,
    },
    {
      key: 'paymentMethod',
      label: 'Payment',
      sortable: true,
      render: (val) => (
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-muted border border-border">{val}</span>
      ),
    },
    {
      key: 'status',
      label: 'Fulfillment Status',
      sortable: true,
      render: (val, row) => (
        <button
          onClick={() => {
            setSelectedOrder(row)
            setNewStatus(row.status)
            setStatusModalOpen(true)
          }}
          className="cursor-pointer block"
        >
          <Badge variant={val}>{val}</Badge>
        </button>
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
              setSelectedOrder(row)
              setDetailsModalOpen(true)
            }}
            className="p-1.5 text-muted-foreground hover:text-primary rounded-lg cursor-pointer"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => {
              if (confirm('Delete this order?')) deleteOrder(row.id)
            }}
            className="p-1.5 text-muted-foreground hover:text-red-500 rounded-lg cursor-pointer"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ]

  const bulkActions = [
    {
      label: 'Mark Shipped',
      action: (ids) => bulkOrders({ action: 'status', ids, status: 'Shipped' }),
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
  if (isError) return <div className="text-sm font-bold text-rose-600">{error?.data?.message || 'Failed to load'}</div>

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <div className="border-b border-border pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-display">Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">Track fulfillment, payments, and customer deliveries.</p>
      </div>

      <AdminTable
        headers={headers}
        data={filteredOrders}
        searchPlaceholder="Search orders..."
        idField="id"
        itemsPerPage={8}
        bulkActions={bulkActions}
        filters={
          <div className="flex flex-wrap gap-2">
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="py-2.5 px-3 text-xs h-10">
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </Select>
            <Select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="py-2.5 px-3 text-xs h-10">
              <option value="all">All Payments</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="COD">COD</option>
            </Select>
          </div>
        }
      />

      <Modal open={statusModalOpen} onClose={() => setStatusModalOpen(false)} title="Update Order Status">
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            await setOrderStatus({ id: selectedOrder.id, status: newStatus }).unwrap()
            setStatusModalOpen(false)
          }}
          className="space-y-4"
        >
          <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} label="Status">
            <option value="Pending">Pending</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </Select>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setStatusModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={detailsModalOpen} onClose={() => setDetailsModalOpen(false)} title={selectedOrder?.orderCode || 'Order'}>
        {selectedOrder && (
          <div className="space-y-3 text-sm">
            <p><span className="text-muted-foreground">Customer:</span> <strong>{selectedOrder.customerName}</strong></p>
            <p><span className="text-muted-foreground">Email:</span> {selectedOrder.customerEmail}</p>
            <p><span className="text-muted-foreground">Phone:</span> {selectedOrder.customerPhone}</p>
            <p><span className="text-muted-foreground">Amount:</span> ₹{selectedOrder.amount}</p>
            <p><span className="text-muted-foreground">Address:</span> {selectedOrder.shippingAddress}</p>
            <div className="border-t border-border pt-3">
              <p className="text-xs font-bold text-muted-foreground mb-2">Items</p>
              {(selectedOrder.items || []).map((item, i) => (
                <p key={i} className="text-xs">{item.name} × {item.quantity} — ₹{item.price}</p>
              ))}
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={() => setDetailsModalOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
