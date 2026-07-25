import React, { useMemo, useState } from 'react'
import { Eye, Trash2 } from 'lucide-react'
import {
  useGetContactsQuery,
  useSetContactStatusMutation,
  useDeleteContactMutation,
  useBulkContactsMutation,
} from '../../../store/api/ops.api'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import Select from '../../../components/ui/Select'
import Modal from '../../../components/ui/Modal'
import AdminTable from '../../../components/shared/AdminTable'
import PageSkeleton from '../../../components/shared/PageSkeleton'

export default function ContactsPage() {
  const { data: env, isLoading, isError, error } = useGetContactsQuery({ limit: 100 })
  const [setStatus, { isLoading: saving }] = useSetContactStatusMutation()
  const [deleteContact] = useDeleteContactMutation()
  const [bulkContacts] = useBulkContactsMutation()
  const contacts = env?.data || []

  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [newStatus, setNewStatus] = useState('New')

  const filtered = useMemo(
    () => contacts.filter((c) => statusFilter === 'all' || c.status === statusFilter),
    [contacts, statusFilter],
  )

  const headers = [
    {
      key: 'contactCode',
      label: 'Code',
      render: (val, row) => <span className="font-mono font-bold text-primary">{val || row.id}</span>,
    },
    {
      key: 'name',
      label: 'From',
      sortable: true,
      render: (_v, row) => (
        <div>
          <p className="font-semibold">{row.name}</p>
          <p className="text-xs text-muted-foreground">{row.email}</p>
        </div>
      ),
    },
    { key: 'subject', label: 'Subject', sortable: true },
    {
      key: 'date',
      label: 'Date',
      render: (val, row) => new Date(val || row.createdAt).toLocaleDateString(),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val, row) => (
        <button
          onClick={() => {
            setSelected(row)
            setNewStatus(row.status)
            setStatusOpen(true)
          }}
          className="cursor-pointer"
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
              setSelected(row)
              setDetailsOpen(true)
              if (row.status === 'New') setStatus({ id: row.id, status: 'Read' })
            }}
            className="p-1.5 hover:text-primary cursor-pointer"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => {
              if (confirm('Delete contact?')) deleteContact(row.id)
            }}
            className="p-1.5 hover:text-red-500 cursor-pointer"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ]

  if (isLoading) return <PageSkeleton />
  if (isError) return <div className="text-sm font-bold text-rose-600">{error?.data?.message || 'Failed to load'}</div>

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="border-b border-border pb-4">
        <h1 className="text-3xl font-extrabold font-display">General Contacts</h1>
        <p className="text-sm text-muted-foreground mt-1">Inbox for website contact form submissions.</p>
      </div>

      <AdminTable
        headers={headers}
        data={filtered}
        searchPlaceholder="Search contacts..."
        idField="id"
        itemsPerPage={8}
        bulkActions={[
          {
            label: 'Mark Read',
            action: (ids) => bulkContacts({ action: 'status', ids, status: 'Read' }),
            variant: 'outline',
          },
          {
            label: 'Delete',
            action: (ids) => {
              if (confirm(`Delete ${ids.length}?`)) bulkContacts({ action: 'delete', ids })
            },
            variant: 'danger',
          },
        ]}
        filters={
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="py-2.5 px-3 text-xs h-10">
            <option value="all">All Statuses</option>
            <option value="New">New</option>
            <option value="Read">Read</option>
            <option value="Replied">Replied</option>
          </Select>
        }
      />

      <Modal open={statusOpen} onClose={() => setStatusOpen(false)} title="Update Status">
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault()
            await setStatus({ id: selected.id, status: newStatus }).unwrap()
            setStatusOpen(false)
          }}
        >
          <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} label="Status">
            <option value="New">New</option>
            <option value="Read">Read</option>
            <option value="Replied">Replied</option>
          </Select>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setStatusOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={detailsOpen} onClose={() => setDetailsOpen(false)} title={selected?.subject || 'Contact'}>
        {selected && (
          <div className="space-y-2 text-sm">
            <p><strong>{selected.name}</strong> — {selected.email}</p>
            <p>{selected.phone}</p>
            <p className="whitespace-pre-wrap border-t border-border pt-3">{selected.message}</p>
            <div className="flex justify-end pt-2"><Button onClick={() => setDetailsOpen(false)}>Close</Button></div>
          </div>
        )}
      </Modal>
    </div>
  )
}
