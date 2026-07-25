import React, { useMemo, useState } from 'react'
import { Eye, Trash2 } from 'lucide-react'
import {
  useGetDealersQuery,
  useSetDealerStatusMutation,
  useDeleteDealerMutation,
  useBulkDealersMutation,
} from '../../../store/api/ops.api'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import Select from '../../../components/ui/Select'
import Modal from '../../../components/ui/Modal'
import AdminTable from '../../../components/shared/AdminTable'
import PageSkeleton from '../../../components/shared/PageSkeleton'

export default function DealersPage() {
  const { data: env, isLoading, isError, error } = useGetDealersQuery({ limit: 100 })
  const [setDealerStatus, { isLoading: saving }] = useSetDealerStatusMutation()
  const [deleteDealer] = useDeleteDealerMutation()
  const [bulkDealers] = useBulkDealersMutation()
  const dealers = env?.data || []

  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [newStatus, setNewStatus] = useState('Pending')

  const filtered = useMemo(
    () => dealers.filter((d) => statusFilter === 'all' || d.status === statusFilter),
    [dealers, statusFilter],
  )

  const headers = [
    {
      key: 'dealerCode',
      label: 'Code',
      sortable: true,
      render: (val, row) => <span className="font-mono font-bold text-primary">{val || row.id}</span>,
    },
    {
      key: 'name',
      label: 'Applicant',
      sortable: true,
      render: (_v, row) => (
        <div>
          <p className="font-semibold">{row.name}</p>
          <p className="text-xs text-muted-foreground">{row.businessName}</p>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Contact',
      render: (_v, row) => (
        <div>
          <p className="text-sm">{row.email}</p>
          <p className="text-xs text-muted-foreground">{row.phone}</p>
        </div>
      ),
    },
    {
      key: 'location',
      label: 'Location',
      render: (_v, row) => row.location || [row.city, row.state].filter(Boolean).join(', ') || '—',
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
              if (confirm('Delete dealer application?')) deleteDealer(row.id)
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
        <h1 className="text-3xl font-extrabold font-display">Dealer Applications</h1>
        <p className="text-sm text-muted-foreground mt-1">Review distributor and dealer partnership requests.</p>
      </div>

      <AdminTable
        headers={headers}
        data={filtered}
        searchPlaceholder="Search dealers..."
        idField="id"
        itemsPerPage={8}
        bulkActions={[
          {
            label: 'Approve',
            action: (ids) => bulkDealers({ action: 'status', ids, status: 'Approved' }),
            variant: 'outline',
          },
          {
            label: 'Delete',
            action: (ids) => {
              if (confirm(`Delete ${ids.length}?`)) bulkDealers({ action: 'delete', ids })
            },
            variant: 'danger',
          },
        ]}
        filters={
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="py-2.5 px-3 text-xs h-10">
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </Select>
        }
      />

      <Modal open={statusOpen} onClose={() => setStatusOpen(false)} title="Update Dealer Status">
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault()
            await setDealerStatus({ id: selected.id, status: newStatus }).unwrap()
            setStatusOpen(false)
          }}
        >
          <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} label="Status">
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </Select>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setStatusOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={detailsOpen} onClose={() => setDetailsOpen(false)} title={selected?.businessName || 'Dealer'}>
        {selected && (
          <div className="space-y-2 text-sm">
            <p><strong>{selected.name}</strong> — {selected.email}</p>
            <p>{selected.phone}</p>
            <p>Investment: {selected.investment || '—'}</p>
            <p>Products: {(selected.interestedProducts || []).join(', ') || '—'}</p>
            <p className="text-muted-foreground">{selected.message}</p>
            <div className="flex justify-end pt-2"><Button onClick={() => setDetailsOpen(false)}>Close</Button></div>
          </div>
        )}
      </Modal>
    </div>
  )
}
