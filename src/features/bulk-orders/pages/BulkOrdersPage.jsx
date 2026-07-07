import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Eye, Trash2 } from 'lucide-react'
import {
  updateBulkOrderStatus,
  deleteBulkOrder,
  bulkUpdateBulkOrderStatus,
  bulkDeleteBulkOrders
} from '../../../store/slices/bulkOrdersSlice'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import Select from '../../../components/ui/Select'
import Modal from '../../../components/ui/Modal'
import AdminTable from '../../../components/shared/AdminTable'

export default function BulkOrdersPage() {
  const dispatch = useDispatch()
  const bulkOrders = useSelector(state => state.bulkOrders.items)

  // Local States
  const [selectedInquiry, setSelectedInquiry] = useState(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [newStatus, setNewStatus] = useState('')

  // Filter States
  const [statusFilter, setStatusFilter] = useState('all')

  // Apply filters
  const filteredInquiries = bulkOrders.filter(b => {
    return statusFilter === 'all' || b.status === statusFilter
  })

  // Handlers
  const handleOpenDetails = (inq) => {
    setSelectedInquiry(inq)
    setDetailsModalOpen(true)
  }

  const handleOpenStatusModal = (inq) => {
    setSelectedInquiry(inq)
    setNewStatus(inq.status)
    setStatusModalOpen(true)
  }

  const handleSaveStatus = (e) => {
    e.preventDefault()
    if (selectedInquiry) {
      dispatch(updateBulkOrderStatus({ id: selectedInquiry.id, status: newStatus }))
      setStatusModalOpen(false)
    }
  }

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this B2B bulk order quote request?')) {
      dispatch(deleteBulkOrder(id))
    }
  }

  // Table Headers
  const headers = [
    {
      key: 'date',
      label: 'Requested Date',
      sortable: true,
      render: (val) => new Date(val).toLocaleDateString([], { dateStyle: 'medium' })
    },
    {
      key: 'organization',
      label: 'Organization / Client',
      sortable: true,
      render: (val, row) => (
        <div>
          <p className="font-semibold text-foreground">{row.organization || 'Individual'}</p>
          <p className="text-xs text-muted-foreground">Rep: {row.name}</p>
        </div>
      )
    },
    {
      key: 'quantity',
      label: 'Volume Requirement',
      sortable: true,
      render: (val) => <span className="font-bold text-foreground">{val}</span>
    },
    {
      key: 'eventDate',
      label: 'Event Target Date',
      sortable: true,
      render: (val) => new Date(val).toLocaleDateString([], { dateStyle: 'medium' })
    },
    {
      key: 'email',
      label: 'Contact Details',
      render: (val, row) => (
        <div>
          <p className="text-sm text-foreground">{row.email}</p>
          <p className="text-xs text-muted-foreground">{row.phone}</p>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Inquiry Status',
      sortable: true,
      render: (val, row) => (
        <button
          onClick={() => handleOpenStatusModal(row)}
          className="cursor-pointer transition-transform active:scale-95 block"
          title="Update Status"
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
            title="View Details"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
            title="Delete Request"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ]

  // Bulk actions
  const bulkActions = [
    {
      label: 'Mark Contacted',
      action: (ids) => dispatch(bulkUpdateBulkOrderStatus({ ids, status: 'Contacted' })),
      variant: 'outline'
    },
    {
      label: 'Mark Completed',
      action: (ids) => dispatch(bulkUpdateBulkOrderStatus({ ids, status: 'Completed' })),
      variant: 'outline'
    },
    {
      label: 'Cancel Inquiries',
      action: (ids) => {
        if (confirm(`Are you sure you want to cancel these ${ids.length} requests?`)) {
          dispatch(bulkUpdateBulkOrderStatus({ ids, status: 'Cancelled' }))
        }
      },
      variant: 'danger'
    },
    {
      label: 'Delete Requests',
      action: (ids) => {
        if (confirm(`Are you sure you want to delete these ${ids.length} requests?`)) {
          dispatch(bulkDeleteBulkOrders(ids))
        }
      },
      variant: 'danger'
    }
  ]

  // Filter Markup
  const FiltersMarkup = (
    <Select
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
      className="py-2.5 px-3 min-w-[140px] text-xs h-10"
    >
      <option value="all">All Inquiries</option>
      <option value="Pending">Pending Review</option>
      <option value="Contacted">Contacted / Quoted</option>
      <option value="Completed">Completed Deals</option>
      <option value="Cancelled">Cancelled Requests</option>
    </Select>
  )

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-display">B2B Bulk Inquiries</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage bulk corporate sales orders, event quotes, and client outreach channels.</p>
        </div>
      </div>

      {/* Dynamic Data Table */}
      <AdminTable
        headers={headers}
        data={filteredInquiries}
        searchPlaceholder="Search by contact name, organization, phone, message..."
        filters={FiltersMarkup}
        bulkActions={bulkActions}
        idField="id"
        itemsPerPage={10}
      />

      {/* DETAILS VIEW MODAL */}
      <Modal
        open={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title="B2B Bulk Quote Proposal"
        className="max-w-lg"
      >
        {selectedInquiry && (
          <div className="space-y-4">
            <div className="p-4 bg-muted/20 border border-border rounded-xl space-y-2">
              <div className="flex justify-between items-center text-xs text-muted-foreground font-bold">
                <span>CLIENT PROFILE</span>
                <span>STATUS: {selectedInquiry.status}</span>
              </div>
              <h3 className="text-lg font-bold text-foreground font-display">{selectedInquiry.organization || 'Individual Customer'}</h3>
              <p className="text-xs text-muted-foreground">Required Volume: <span className="text-foreground font-bold">{selectedInquiry.quantity}</span></p>
              <p className="text-xs text-muted-foreground">Target Event Date: <span className="text-foreground font-bold">{new Date(selectedInquiry.eventDate).toLocaleDateString([], { dateStyle: 'medium' })}</span></p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">Point of Contact</h4>
              <div className="bg-card border border-border p-3 rounded-xl text-xs space-y-1">
                <p className="font-bold text-foreground">{selectedInquiry.name}</p>
                <p className="text-muted-foreground">Email: {selectedInquiry.email}</p>
                <p className="text-muted-foreground">Phone: {selectedInquiry.phone}</p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">Requirement Notes</h4>
              <div className="bg-muted/10 border border-dashed border-border p-3.5 rounded-xl text-xs leading-relaxed text-foreground italic">
                "{selectedInquiry.message}"
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-border pt-4 mt-2">
              <Button
                variant="outline"
                className="flex items-center gap-1.5 text-xs py-2"
                onClick={() => handleOpenStatusModal(selectedInquiry)}
              >
                Change Fulfillment Status
              </Button>
              <Button onClick={() => setDetailsModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* STATUS ACTION MODAL */}
      <Modal
        open={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Update Inquiry Status"
      >
        {selectedInquiry && (
          <form onSubmit={handleSaveStatus} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Review and record progress on B2B inquiry for <span className="font-bold text-foreground">{selectedInquiry.organization || selectedInquiry.name}</span>.
            </p>

            <Select
              label="Fulfillment Pipeline"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="Pending">Pending (New Request)</option>
              <option value="Contacted">Contacted (Quote Provided)</option>
              <option value="Completed">Completed (Deal Closed)</option>
              <option value="Cancelled">Cancelled (No Deal)</option>
            </Select>

            <div className="flex gap-2 justify-end border-t border-border pt-4 mt-2">
              <Button variant="secondary" onClick={() => setStatusModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Save Verdict
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
