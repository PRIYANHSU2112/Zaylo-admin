import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Eye, MailOpen, Trash2 } from 'lucide-react'
import {
  updateContactStatus,
  deleteContact,
  bulkUpdateContactStatus,
  bulkDeleteContacts
} from '../../../store/slices/contactsSlice'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import Select from '../../../components/ui/Select'
import Modal from '../../../components/ui/Modal'
import AdminTable from '../../../components/shared/AdminTable'

export default function ContactsPage() {
  const dispatch = useDispatch()
  const contacts = useSelector(state => state.contacts.items)

  // Local States
  const [selectedContact, setSelectedContact] = useState(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')

  // Apply filters
  const filteredContacts = contacts.filter(c => {
    return statusFilter === 'all' || c.status === statusFilter
  })

  // Handlers
  const handleOpenDetails = (inq) => {
    setSelectedContact(inq)
    setDetailsModalOpen(true)
    
    // Automatically mark as Read if it was New
    if (inq.status === 'New') {
      dispatch(updateContactStatus({ id: inq.id, status: 'Read' }))
    }
  }

  const handleMarkReplied = (id) => {
    dispatch(updateContactStatus({ id, status: 'Replied' }))
    setDetailsModalOpen(false)
  }

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this contact inquiry?')) {
      dispatch(deleteContact(id))
    }
  }

  // Table Headers
  const headers = [
    {
      key: 'date',
      label: 'Submitted On',
      sortable: true,
      render: (val) => new Date(val).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
    },
    {
      key: 'name',
      label: 'Sender',
      sortable: true,
      render: (val, row) => (
        <div>
          <p className="font-semibold text-foreground">{row.name}</p>
          <p className="text-xs text-muted-foreground">{row.email}</p>
        </div>
      )
    },
    {
      key: 'subject',
      label: 'Subject Headline',
      sortable: true,
      render: (val) => <span className="font-medium text-foreground capitalize">{val}</span>
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => (
        <Badge variant={val}>{val}</Badge>
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
            title="Read Inquiry"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
            title="Delete Inquiry"
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
      label: 'Mark as Read',
      action: (ids) => dispatch(bulkUpdateContactStatus({ ids, status: 'Read' })),
      variant: 'outline'
    },
    {
      label: 'Mark as Replied',
      action: (ids) => dispatch(bulkUpdateContactStatus({ ids, status: 'Replied' })),
      variant: 'outline'
    },
    {
      label: 'Delete Inquiries',
      action: (ids) => {
        if (confirm(`Are you sure you want to delete these ${ids.length} inquiries?`)) {
          dispatch(bulkDeleteContacts(ids))
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
      <option value="all">All Inquiries</option>
      <option value="New">Unread (New)</option>
      <option value="Read">Read</option>
      <option value="Replied">Replied</option>
    </Select>
  )

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-display">General Contacts</h1>
          <p className="text-sm text-muted-foreground mt-1">Inbox for general client submissions, complaints, feed back, and questions.</p>
        </div>
      </div>

      {/* Dynamic Data Table */}
      <AdminTable
        headers={headers}
        data={filteredContacts}
        searchPlaceholder="Search inbox by sender name, subject, body content..."
        filters={FiltersMarkup}
        bulkActions={bulkActions}
        idField="id"
        itemsPerPage={10}
      />

      {/* DETAILS VIEW MODAL */}
      <Modal
        open={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title="Customer Support Message"
        className="max-w-lg"
      >
        {selectedContact && (
          <div className="space-y-4">
            <div className="p-4 bg-muted/20 border border-border rounded-xl space-y-1">
              <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground">
                <span>INBOX ID: {selectedContact.id}</span>
                <span>SUBMITTED: {new Date(selectedContact.date).toLocaleString()}</span>
              </div>
              <h3 className="text-sm font-bold text-foreground capitalize mt-1">Subject: {selectedContact.subject}</h3>
              <p className="text-xs text-muted-foreground">Sender: <span className="text-foreground font-bold">{selectedContact.name}</span> ({selectedContact.email})</p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">Message Content</h4>
              <div className="bg-muted/10 border border-dashed border-border p-3.5 rounded-xl text-xs leading-relaxed text-foreground">
                {selectedContact.message}
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-border pt-4 mt-2">
              <div className="flex gap-2">
                {selectedContact.status !== 'Replied' && (
                  <Button
                    variant="primary"
                    className="text-xs py-2 flex items-center gap-1.5"
                    onClick={() => handleMarkReplied(selectedContact.id)}
                  >
                    <MailOpen size={14} /> Record Reply Dispatched
                  </Button>
                )}
              </div>
              <Button variant="secondary" onClick={() => setDetailsModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
