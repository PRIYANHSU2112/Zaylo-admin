import React, { useMemo, useState } from 'react'
import { Eye, Trash2 } from 'lucide-react'
import {
  useGetBulkOrdersQuery,
  useSetBulkOrderStatusMutation,
  useDeleteBulkOrderMutation,
  useBulkBulkOrdersMutation,
} from '../../../store/api/ops.api'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import Select from '../../../components/ui/Select'
import Modal from '../../../components/ui/Modal'
import AdminTable from '../../../components/shared/AdminTable'
import PageSkeleton from '../../../components/shared/PageSkeleton'

export default function BulkOrdersPage() {
  const { data: env, isLoading, isError, error } = useGetBulkOrdersQuery({ limit: 100 })
  const [setStatus, { isLoading: saving }] = useSetBulkOrderStatusMutation()
  const [deleteItem] = useDeleteBulkOrderMutation()
  const [bulkAction] = useBulkBulkOrdersMutation()
  const items = env?.data || []

  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [newStatus, setNewStatus] = useState('Pending')

  const filtered = useMemo(
    () => items.filter((b) => statusFilter === 'all' || b.status === statusFilter),
    [items, statusFilter],
  )

  const headers = [
    {
      key: 'bulkCode',
      label: 'Code',
      sortable: true,
      render: (val, row) => <span className="font-mono font-bold text-primary">{val || row.id}</span>,
    },
    {
      key: 'name',
      label: 'Requester',
      sortable: true,
      render: (_v, row) => (
        <div>
          <p className="font-semibold">{row.name}</p>
          <p className="text-xs text-muted-foreground">{row.organization || row.companyName || '—'}</p>
        </div>
      ),
    },
    {
      key: 'quantity',
      label: 'Quantity',
      render: (val) => val || '—',
    },
    {
      key: 'inquiryType',
      label: 'Type',
      render: (val) => val || '—',
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
            }}
            className="p-1.5 hover:text-primary cursor-pointer"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => {
              if (confirm('Delete bulk order?')) deleteItem(row.id)
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
        <h1 className="text-3xl font-extrabold font-display">Bulk Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">B2B quote requests and wholesale inquiries.</p>
      </div>

      <AdminTable
        headers={headers}
        data={filtered}
        searchPlaceholder="Search bulk orders..."
        idField="id"
        itemsPerPage={8}
        bulkActions={[
          {
            label: 'Mark Contacted',
            action: (ids) => bulkAction({ action: 'status', ids, status: 'Contacted' }),
            variant: 'outline',
          },
          {
            label: 'Delete',
            action: (ids) => {
              if (confirm(`Delete ${ids.length}?`)) bulkAction({ action: 'delete', ids })
            },
            variant: 'danger',
          },
        ]}
        filters={
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="py-2.5 px-3 text-xs h-10">
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Contacted">Contacted</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
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
            <option value="Pending">Pending</option>
            <option value="Contacted">Contacted</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </Select>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setStatusOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={detailsOpen} onClose={() => setDetailsOpen(false)} title="Bulk Quote Details">
        {selected && (
          <div className="space-y-2 text-sm">
            <p><strong>{selected.name}</strong> — {selected.email}</p>
            <p>{selected.phone}</p>
            <p>Qty: {selected.quantity} · Event: {selected.eventDate || '—'}</p>
            <p className="text-muted-foreground">{selected.message || selected.details}</p>
            <div className="flex justify-end pt-2"><Button onClick={() => setDetailsOpen(false)}>Close</Button></div>
          </div>
        )}
      </Modal>
    </div>
  )
}
