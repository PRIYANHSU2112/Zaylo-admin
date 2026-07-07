import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Eye, Trash2 } from 'lucide-react'
import {
  updateOrderStatus,
  deleteOrder,
  bulkUpdateOrderStatus,
  bulkDeleteOrders
} from '../../../store/slices/ordersSlice'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import Select from '../../../components/ui/Select'
import Modal from '../../../components/ui/Modal'
import AdminTable from '../../../components/shared/AdminTable'

export default function OrdersPage() {
  const dispatch = useDispatch()
  const orders = useSelector(state => state.orders.items)

  // Local States
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [newStatus, setNewStatus] = useState('')

  // Filter States
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')

  // Apply filters
  const filteredOrders = orders.filter(o => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter
    const matchesPayment = paymentFilter === 'all' || o.paymentMethod === paymentFilter
    return matchesStatus && matchesPayment
  })

  // Handlers
  const handleOpenDetails = (order) => {
    setSelectedOrder(order)
    setDetailsModalOpen(true)
  }

  const handleOpenStatusModal = (order) => {
    setSelectedOrder(order)
    setNewStatus(order.status)
    setStatusModalOpen(true)
  }

  const handleSaveStatus = (e) => {
    e.preventDefault()
    if (selectedOrder) {
      dispatch(updateOrderStatus({ id: selectedOrder.id, status: newStatus }))
      setStatusModalOpen(false)
    }
  }

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this order record? This cannot be undone.')) {
      dispatch(deleteOrder(id))
    }
  }

  // Table Headers
  const headers = [
    {
      key: 'id',
      label: 'Order ID',
      sortable: true,
      render: (val) => <span className="font-bold font-mono text-primary">{val}</span>
    },
    {
      key: 'date',
      label: 'Date & Time',
      sortable: true,
      render: (val) => new Date(val).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
    },
    {
      key: 'customerName',
      label: 'Customer Details',
      sortable: true,
      render: (val, row) => (
        <div>
          <p className="font-semibold text-foreground">{row.customerName}</p>
          <p className="text-xs text-muted-foreground">{row.customerEmail} • {row.customerPhone}</p>
        </div>
      )
    },
    {
      key: 'amount',
      label: 'Total Amount',
      sortable: true,
      render: (val) => <span className="font-bold text-foreground">${parseFloat(val).toFixed(2)}</span>
    },
    {
      key: 'paymentMethod',
      label: 'Payment',
      sortable: true,
      render: (val) => (
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-muted text-foreground border border-border">
          {val}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Fulfillment Status',
      sortable: true,
      render: (val, row) => (
        <button
          onClick={() => handleOpenStatusModal(row)}
          className="cursor-pointer transition-transform active:scale-95 block"
          title="Click to change status"
        >
          <Badge variant={val}>{val}</Badge>
        </button>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (val, row) => (
        <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => handleOpenDetails(row)}
            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary-light rounded-lg transition-colors cursor-pointer"
            title="View Invoice"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
            title="Delete Record"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ]

  // Bulk Actions
  const bulkActions = [
    {
      label: 'Mark Shipped',
      action: (ids) => dispatch(bulkUpdateOrderStatus({ ids, status: 'Shipped' })),
      variant: 'outline'
    },
    {
      label: 'Mark Delivered',
      action: (ids) => dispatch(bulkUpdateOrderStatus({ ids, status: 'Delivered' })),
      variant: 'outline'
    },
    {
      label: 'Cancel Orders',
      action: (ids) => {
        if (confirm(`Are you sure you want to cancel these ${ids.length} orders?`)) {
          dispatch(bulkUpdateOrderStatus({ ids, status: 'Cancelled' }))
        }
      },
      variant: 'danger'
    },
    {
      label: 'Delete Records',
      action: (ids) => {
        if (confirm(`Are you sure you want to delete these ${ids.length} order records?`)) {
          dispatch(bulkDeleteOrders(ids))
        }
      },
      variant: 'danger'
    }
  ]

  // Filters Markup
  const FiltersMarkup = (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="py-2.5 px-3 min-w-[140px] text-xs h-10"
      >
        <option value="all">All Statuses</option>
        <option value="Pending">Pending</option>
        <option value="Shipped">Shipped</option>
        <option value="Delivered">Delivered</option>
        <option value="Cancelled">Cancelled</option>
      </Select>
      <Select
        value={paymentFilter}
        onChange={(e) => setPaymentFilter(e.target.value)}
        className="py-2.5 px-3 min-w-[140px] text-xs h-10"
      >
        <option value="all">All Payments</option>
        <option value="UPI">UPI</option>
        <option value="COD">COD</option>
        <option value="Card">Card</option>
      </Select>
    </div>
  )

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-display">Orders Fulfillment</h1>
          <p className="text-sm text-muted-foreground mt-1">Process e-commerce customer checkouts, invoice receipts, and transit statuses.</p>
        </div>
      </div>

      {/* Dynamic Data Table */}
      <AdminTable
        headers={headers}
        data={filteredOrders}
        searchPlaceholder="Search orders by ID, name, email, addresses..."
        filters={FiltersMarkup}
        bulkActions={bulkActions}
        idField="id"
        itemsPerPage={10}
      />

      {/* INVOICE DETAIL VIEW MODAL */}
      <Modal
        open={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title={`Invoice: ${selectedOrder?.id}`}
        className="max-w-xl"
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="flex justify-between items-start p-4 bg-muted/20 border border-border rounded-xl">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold">Fulfillment Status</p>
                <div className="mt-1">
                  <Badge variant={selectedOrder.status}>{selectedOrder.status}</Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase font-bold">Payment Method</p>
                <p className="text-sm font-bold text-foreground mt-1">{selectedOrder.paymentMethod}</p>
              </div>
            </div>

            {/* Customer info */}
            <div>
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5">Shipping Details</h4>
              <div className="bg-card border border-border p-3.5 rounded-xl text-xs space-y-1">
                <p className="font-bold text-foreground">{selectedOrder.customerName}</p>
                <p className="text-muted-foreground">Phone: {selectedOrder.customerPhone}</p>
                <p className="text-muted-foreground">Email: {selectedOrder.customerEmail}</p>
                <p className="text-foreground mt-2 font-medium">Address: {selectedOrder.shippingAddress}</p>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5">Itemized Snacks</h4>
              <div className="border border-border rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border font-bold">
                      <th className="py-2.5 px-4">Snack Product</th>
                      <th className="py-2.5 px-4 text-center">Qty</th>
                      <th className="py-2.5 px-4 text-right">Price</th>
                      <th className="py-2.5 px-4 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {selectedOrder.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-muted/10">
                        <td className="py-2.5 px-4 font-semibold text-foreground">{item.name}</td>
                        <td className="py-2.5 px-4 text-center">{item.quantity}</td>
                        <td className="py-2.5 px-4 text-right">${parseFloat(item.price).toFixed(2)}</td>
                        <td className="py-2.5 px-4 text-right font-bold text-foreground">
                          ${(item.price * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-muted/10 font-bold border-t border-border">
                      <td colSpan="3" className="py-3 px-4 text-right text-sm">Total Paid:</td>
                      <td className="py-3 px-4 text-right text-sm text-primary font-extrabold font-display">
                        ${parseFloat(selectedOrder.amount).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="flex gap-2 justify-end border-t border-border pt-4 mt-2">
              <Button variant="secondary" onClick={() => handleOpenStatusModal(selectedOrder)}>
                Change Status
              </Button>
              <Button onClick={() => setDetailsModalOpen(false)}>
                Close Invoice
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* QUICK STATUS UPDATE MODAL */}
      <Modal
        open={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Update Order Status"
      >
        {selectedOrder && (
          <form onSubmit={handleSaveStatus} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Modify the delivery status for Order <span className="font-mono font-bold text-foreground">{selectedOrder.id}</span>.
            </p>
            
            <Select
              label="Fulfillment Status"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="Pending">Pending (Awaiting fulfillment)</option>
              <option value="Shipped">Shipped (In transit)</option>
              <option value="Delivered">Delivered (Completed)</option>
              <option value="Cancelled">Cancelled (Nullified)</option>
            </Select>

            <div className="flex gap-2 justify-end border-t border-border pt-4 mt-2">
              <Button variant="secondary" onClick={() => setStatusModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Save Status
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
