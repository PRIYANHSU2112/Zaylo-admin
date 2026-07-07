import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Eye, UserPlus, Trash2 } from 'lucide-react'
import {
  updateDealerStatus,
  deleteDealer,
  bulkDeleteDealers
} from '../../../store/slices/dealersSlice'
import { addUser } from '../../../store/slices/usersSlice'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import Select from '../../../components/ui/Select'
import Modal from '../../../components/ui/Modal'
import AdminTable from '../../../components/shared/AdminTable'

export default function DealersPage() {
  const dispatch = useDispatch()
  const dealers = useSelector(state => state.dealers.items)
  const users = useSelector(state => state.users.items)

  // Local States
  const [selectedDealer, setSelectedDealer] = useState(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [newStatus, setNewStatus] = useState('')

  // Filter States
  const [statusFilter, setStatusFilter] = useState('all')

  // Apply filters
  const filteredDealers = dealers.filter(d => {
    return statusFilter === 'all' || d.status === statusFilter
  })

  // Handlers
  const handleOpenDetails = (dealer) => {
    setSelectedDealer(dealer)
    setDetailsModalOpen(true)
  }

  const handleOpenStatusModal = (dealer) => {
    setSelectedDealer(dealer)
    setNewStatus(dealer.status)
    setStatusModalOpen(true)
  }

  const handleSaveStatus = (e) => {
    e.preventDefault()
    if (selectedDealer) {
      dispatch(updateDealerStatus({ id: selectedDealer.id, status: newStatus }))
      
      // If approved and doesn't exist as user, we can prompt or automatically register
      if (newStatus === 'Approved') {
        const userExists = users.some(u => u.email === selectedDealer.email)
        if (!userExists) {
          // Add to system users slice as Distributor
          dispatch(addUser({
            name: selectedDealer.name,
            email: selectedDealer.email,
            phone: selectedDealer.phone,
            role: 'Distributor',
            status: 'Active'
          }))
        }
      }
      setStatusModalOpen(false)
    }
  }

  const handleConvertToUser = (dealer) => {
    const userExists = users.some(u => u.email === dealer.email)
    if (userExists) {
      alert('This distributor already has a registered user account!')
      return
    }

    dispatch(addUser({
      name: dealer.name,
      email: dealer.email,
      phone: dealer.phone,
      role: 'Distributor',
      status: 'Active'
    }))

    // Approve the dealer application status
    dispatch(updateDealerStatus({ id: dealer.id, status: 'Approved' }))
    alert(`Successfully created distributor user account for ${dealer.name}!`);
    setDetailsModalOpen(false)
  }

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this application?')) {
      dispatch(deleteDealer(id))
    }
  }

  // Table Headers
  const headers = [
    {
      key: 'date',
      label: 'Applied On',
      sortable: true,
      render: (val) => new Date(val).toLocaleDateString([], { dateStyle: 'medium' })
    },
    {
      key: 'businessName',
      label: 'Distributor Agency',
      sortable: true,
      render: (val, row) => (
        <div>
          <p className="font-semibold text-foreground">{row.businessName}</p>
          <p className="text-xs text-muted-foreground">Owner: {row.name}</p>
        </div>
      )
    },
    {
      key: 'location',
      label: 'Location/Territory',
      sortable: true
    },
    {
      key: 'investment',
      label: 'Investment Cap',
      sortable: true,
      render: (val) => (
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-muted text-foreground border border-border">
          {val}
        </span>
      )
    },
    {
      key: 'email',
      label: 'Contact Info',
      render: (val, row) => (
        <div>
          <p className="text-sm text-foreground">{row.email}</p>
          <p className="text-xs text-muted-foreground">{row.phone}</p>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val, row) => (
        <button
          onClick={() => handleOpenStatusModal(row)}
          className="cursor-pointer transition-transform active:scale-95 block"
          title="Change Status"
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
            title="Delete Application"
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
      label: 'Approve Selected',
      action: (ids) => {
        ids.forEach(id => {
          const item = dealers.find(d => d.id === id)
          if (item) {
            dispatch(updateDealerStatus({ id, status: 'Approved' }))
            // Create user
            dispatch(addUser({
              name: item.name,
              email: item.email,
              phone: item.phone,
              role: 'Distributor',
              status: 'Active'
            }))
          }
        })
      },
      variant: 'outline'
    },
    {
      label: 'Delete Selected',
      action: (ids) => {
        if (confirm(`Are you sure you want to delete these ${ids.length} applications?`)) {
          dispatch(bulkDeleteDealers(ids))
        }
      },
      variant: 'danger'
    }
  ]

  // Filters Markup
  const FiltersMarkup = (
    <Select
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
      className="py-2.5 px-3 min-w-[140px] text-xs h-10"
    >
      <option value="all">All Applications</option>
      <option value="Pending">Pending Review</option>
      <option value="Approved">Approved Agencies</option>
      <option value="Rejected">Rejected Applications</option>
    </Select>
  )

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-display">Dealer Applications</h1>
          <p className="text-sm text-muted-foreground mt-1">Review registrations, approve distribution territories, and provision accounts.</p>
        </div>
      </div>

      {/* Dynamic Data Table */}
      <AdminTable
        headers={headers}
        data={filteredDealers}
        searchPlaceholder="Search by owner name, agency, locations, email..."
        filters={FiltersMarkup}
        bulkActions={bulkActions}
        idField="id"
        itemsPerPage={10}
      />

      {/* DETAILS VIEW MODAL */}
      <Modal
        open={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title="Distributor Application Review"
        className="max-w-lg"
      >
        {selectedDealer && (
          <div className="space-y-4">
            <div className="p-4 bg-muted/20 border border-border rounded-xl space-y-2">
              <div className="flex justify-between items-center text-xs text-muted-foreground font-bold">
                <span>BUSINESS ENTITY</span>
                <span>STATUS: {selectedDealer.status}</span>
              </div>
              <h3 className="text-lg font-bold text-foreground font-display">{selectedDealer.businessName}</h3>
              <p className="text-xs text-muted-foreground">Location: <span className="text-foreground font-bold">{selectedDealer.location}</span></p>
              <p className="text-xs text-muted-foreground">Investment Cap: <span className="text-foreground font-bold">{selectedDealer.investment}</span></p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">Applicant Contact</h4>
              <div className="bg-card border border-border p-3 rounded-xl text-xs space-y-1">
                <p className="font-bold text-foreground">{selectedDealer.name}</p>
                <p className="text-muted-foreground">Email: {selectedDealer.email}</p>
                <p className="text-muted-foreground">Phone: {selectedDealer.phone}</p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">Proposal Pitch</h4>
              <div className="bg-muted/10 border border-dashed border-border p-3.5 rounded-xl text-xs leading-relaxed text-foreground italic">
                "{selectedDealer.message}"
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-between items-center border-t border-border pt-4 mt-2">
              {/* Account Provision Shortcut */}
              <Button
                variant="outline"
                className="flex items-center gap-1.5 text-xs py-2"
                onClick={() => handleConvertToUser(selectedDealer)}
              >
                <UserPlus size={14} /> Provision Distributor User
              </Button>
              
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setDetailsModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* STATUS ACTION MODAL */}
      <Modal
        open={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Review Application Status"
      >
        {selectedDealer && (
          <form onSubmit={handleSaveStatus} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Review agency application for <span className="font-bold text-foreground">{selectedDealer.businessName}</span>. Approving will automatically provision a Distributor user account if not already created.
            </p>

            <Select
              label="Application Verdict"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="Pending">Pending (Under Review)</option>
              <option value="Approved">Approved (Accredit Agency)</option>
              <option value="Rejected">Rejected (Decline Application)</option>
            </Select>

            <div className="flex gap-2 justify-end border-t border-border pt-4 mt-2">
              <Button variant="secondary" onClick={() => setStatusModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Submit Verdict
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
